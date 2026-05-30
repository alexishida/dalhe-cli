# Segurança — Rails 7/8

Prioridade máxima. Cada item abaixo tem: o que procurar, por que é perigoso, e
o padrão correto. Use grep/leitura direcionada — não confie só em ferramentas.

## 1. SQL Injection

O risco mais comum e mais grave em Rails legado.

**Procurar:** interpolação de variável dentro de strings passadas a `where`,
`find_by_sql`, `exists?`, `order`, `group`, `pluck`, `joins`, `select`.

```ruby
# ERRADO — injeção
User.where("name = '#{params[:name]}'")
Order.order(params[:sort])                 # injeção via ORDER BY
User.find_by_sql("SELECT * FROM users WHERE id = #{params[:id]}")

# CERTO
User.where(name: params[:name])
User.where("name = ?", params[:name])
Order.order(sanitize_sql_for_order(params[:sort]))   # ou allowlist
```

Atenção redobrada com `order`/`pluck`/`select` por coluna vinda do usuário:
ActiveRecord **não** parametriza esses; use allowlist explícita de colunas.

## 2. Mass Assignment

**Procurar:** `permit!`, ausência de Strong Parameters, `update`/`create`/
`new`/`assign_attributes` recebendo `params[...]` cru, `update_attribute` (pula
validações).

```ruby
# ERRADO
user.update(params[:user])
params.require(:user).permit!          # permite tudo, inclusive role/admin

# CERTO
def user_params
  params.require(:user).permit(:name, :email)   # allowlist explícita
end
user.update(user_params)
```

Verifique especialmente campos sensíveis (`admin`, `role`, `*_id`, `approved`)
que não devem estar no `permit`.

## 3. Secrets e credenciais

**Procurar:** chaves/API tokens/senhas hardcoded em código, `config/`,
`database.yml`, fixtures, ou commitados em `.env`, `master.key`,
`config/credentials.yml.enc` versionado sem proteção.

```ruby
# ERRADO
OracleClient.new(password: "Pr0d#2024")
Stripe.api_key = "sk_live_..."

# CERTO
Rails.application.credentials.dig(:oracle, :password)
ENV.fetch("STRIPE_SECRET_KEY")
```

Cheque o histórico/arquivos por `password:`, `secret`, `api_key`, `token`,
`BEGIN RSA PRIVATE KEY`. Sinalize `master.key` rastreado pelo git.

## 4. Autenticação e autorização

- Controllers sem `before_action :authenticate_*` onde deveria haver.
- Autorização ausente: qualquer usuário logado acessando recurso de outro
  (IDOR). Procure `find(params[:id])` sem escopo do usuário atual.

```ruby
# ERRADO — qualquer um vê qualquer pedido
@order = Order.find(params[:id])

# CERTO — escopo no usuário
@order = current_user.orders.find(params[:id])
```

- Verifique se Pundit/CanCanCan (se presentes) são realmente aplicados nas
  ações sensíveis, não só declarados.

## 5. CSRF e proteção de requisição

- `protect_from_forgery` desabilitado globalmente ou
  `skip_before_action :verify_authenticity_token` largo demais.
- APIs que aceitam estado mutável sem token nem autenticação por header.

## 6. Deserialização e execução insegura

**Procurar:** `Marshal.load`, `YAML.load` (use `YAML.safe_load`),
`eval`, `constantize`/`send`/`public_send` com entrada do usuário,
`system`/`` ` ``/`%x`/`Open3` com string interpolada do usuário (command
injection).

```ruby
# ERRADO
system("convert #{params[:file]} out.png")
klass = params[:type].constantize

# CERTO
system("convert", params[:file], "out.png")          # args separados
ALLOWED = { "pdf" => PdfJob }.freeze
ALLOWED.fetch(params[:type])
```

## 7. SSRF e open redirect

- `Net::HTTP`/`open-uri`/`HTTParty` com URL vinda do usuário sem allowlist.
- `redirect_to params[:url]` / `redirect_to params[:return_to]` sem validar
  host → open redirect. Use `redirect_to ..., allow_other_host: false`
  (padrão no Rails 7) e valide.

## 8. Exposição de dados

- `render json: @user` expondo `password_digest`, tokens, dados internos.
  Verifique serializers / `as_json` com allowlist.
- Logs imprimindo params com senha/cartão (cheque `filter_parameters`).
- Mensagens de erro detalhadas em produção (`config.consider_all_requests_local`).

## 9. Dependências vulneráveis

Rode `bundler-audit` se possível. Sinalize gems com CVE conhecido e versões
de Rails fora de suporte de segurança (Rails < 7.0 não recebe patches).

## 10. Específico de view

- `raw`, `html_safe`, `<%== %>` com conteúdo do usuário → XSS.
- `link_to` / `sanitize` com `tags:` permissivo demais.

```erb
<%# ERRADO %>
<%= raw @comment.body %>
<%# CERTO %>
<%= @comment.body %>   <%# Rails escapa por padrão %>
```
