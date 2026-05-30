# Gambiarras e Antipadrões — Rails 7/8

Foco em dívida técnica que vira bug ou trava manutenção da equipe. Para cada
item: como reconhecer e como deveria ser.

## 1. Tratamento de erro silencioso

O clássico "engole o erro e segue".

```ruby
# GAMBIARRA
begin
  cobranca.processar!
rescue => e
end

something rescue nil
```

Problema: falhas viram bugs invisíveis em produção. Correto: tratar de forma
específica, logar, e re-raise quando não houver recuperação real.

```ruby
rescue Payment::Error => e
  Rails.logger.error("Falha cobrança #{cobranca.id}: #{e.message}")
  raise
```

Sinalize qualquer `rescue` sem classe específica, `rescue Exception`
(captura `SignalException`/`SystemExit`), e `rescue nil`.

## 2. Fat models / fat controllers

- Controller com regra de negócio, queries complexas, múltiplas
  responsabilidades por action.
- Model com centenas de linhas, dezenas de callbacks, lógica de apresentação.

Sugira extração para service objects, query objects, form objects ou
concerns coesos — alinhado ao que o time já usa (veja `conventions.md`).

## 3. Callbacks abusivos

`after_save`/`after_commit` disparando e-mail, chamada HTTP externa, ou
alterando outros models em cascata. Difícil de testar, efeitos colaterais
escondidos, ordem frágil.

```ruby
# PROBLEMA
after_save :enviar_email, :sincronizar_erp, :recalcular_saldo
```

Sugira mover efeitos colaterais para a camada de serviço/jobs explícitos.

## 4. Monkey patch sem necessidade

Reabertura de classes do Rails/Ruby/gems em `lib/` ou `config/initializers`
sobrescrevendo comportamento padrão. Quebra em upgrade de versão.

Sinalize patches em `String`, `ActiveRecord::Base`, `Hash`, etc. Avalie se
um refinement, decorator ou subclasse resolveria.

## 5. Lógica em migrations

```ruby
# GAMBIARRA — migration que roda regra de negócio com a classe do model
def up
  User.where(active: nil).each { |u| u.update!(active: true) }
end
```

Problemas: usa o model atual (muda no futuro), sem batches (trava tabela
grande), sem reversibilidade. Use SQL direto/`update_all` em lotes e mantenha
migrations só com schema; backfill de dados em task/rake separada e idempotente.

## 6. Código morto e duplicação

- Métodos/classes não referenciados, rotas órfãs, branches inalcançáveis.
- Trechos copiados entre controllers/models. Sinalize duplicação clara e
  proponha extração.

## 7. Condicionais e aninhamento excessivo

`if/elsif` profundos, ternários encadeados, `unless ... else`, flags booleanas
proliferando. Sugira guard clauses, polimorfismo ou objetos de estado.

```ruby
# Antes
def status
  if a then if b then "x" else "y" end else "z" end
end
# Depois: guard clauses
return "z" unless a
b ? "x" : "y"
```

## 8. Valores mágicos e configuração espalhada

Números/strings mágicos (`if status == 3`), URLs e timeouts hardcoded.
Sugira constantes nomeadas, enums ActiveRecord, ou config centralizada.

## 9. N+1 e queries dentro de loop

Tratado em detalhe em `database-oracle-mariadb.md`, mas é também um smell de
código: query/`.count`/`.where` dentro de `.each`/`.map`. Use `includes`,
`preload`, agregação no banco.

## 10. Uso indevido de `update_column(s)` / `save(validate: false)`

Pula validações e callbacks "para funcionar logo". Geralmente esconde uma
validação mal modelada. Sinalize e questione a intenção.

## 11. Comentários do tipo "TODO/FIXME/HACK/XXX"

Faça grep por esses marcadores. Não são erros, mas indicam gambiarras
assumidas pelo autor — liste-os como dívida conhecida (severidade BAIXO/MÉDIO
conforme o contexto).

## 12. Concorrência ingênua

- `find_or_create_by` sem unique index (race condition → duplicados).
- Incremento de contador via read-modify-write em vez de `increment!`/SQL
  atômico.
- Job sem idempotência reprocessando efeito colateral.
