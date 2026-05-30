# Padrões e Convenções de Equipe — Rails 7/8

Objetivo: consistência. Como líder, o valor aqui é menos "regra universal" e
mais "o time faz igual e idiomático". **Sempre prefira a convenção que o
projeto já adota** (leia `.rubocop.yml`, estrutura de pastas existente) a impor
uma preferência externa.

## 1. Idiomático Rails / Ruby

- Use os helpers do Rails em vez de reinventar: `present?`/`blank?`,
  `find_each` para grandes coleções, `pluck` em vez de `map(&:attr)` quando só
  precisa do valor, `Time.current`/`Date.current` (timezone-aware) em vez de
  `Time.now`/`Date.today`.
- `where.not`, `exists?`, `none?` em vez de carregar e checar em Ruby.
- Enums ActiveRecord para estados em vez de inteiros/strings soltos.

## 2. Organização de camadas

Verifique se o projeto tem uma convenção e se ela é seguida de forma
consistente:

- Regra de negócio fora do controller (service/interactor/command).
- Queries reaproveitáveis em query objects ou scopes nomeados, não copiadas.
- `concerns` coesos (não como "lixeira" de métodos diversos).
- Lógica de apresentação em helpers/decorators/presenters, não no model.

O problema a sinalizar não é "não usa service object", é **inconsistência**:
metade do app usa, a outra metade põe tudo no controller.

## 3. Nomeação

- Classes/métodos descritivos; métodos com `?` retornam boolean; `!` indica
  versão perigosa/que muta ou levanta exceção.
- Sem abreviações obscuras; nomes em um idioma só (cheque mistura
  português/inglês inconsistente — se o time usa português, mantenha).
- Migrations e tabelas no padrão Rails (plural, snake_case).

## 4. Strong Parameters e validações

- Params sempre via método `*_params` privado nomeado, não inline.
- Validações no model, não espalhadas em controllers.
- Use `validates` declarativo em vez de validação manual em callback quando
  possível.

## 5. Internacionalização

Se o projeto usa i18n, strings de UI não devem estar hardcoded em views/
controllers. Sinalize texto literal voltado ao usuário fora de `config/locales`.

## 6. Testes

- Há cobertura para o código novo/alterado? (no escopo de PR isso é crítico)
- Testes determinísticos: sem dependência de ordem, sem `sleep`, sem chamadas
  de rede reais (use stubs/VCR).
- Factories em vez de fixtures gigantes, se for a convenção do time.
- Nome do teste descreve o comportamento, não o método.

## 7. Configuração e ambientes

- Diferenças de ambiente via `config/environments/*` e credentials, não
  `if Rails.env.production?` espalhado pelo código de domínio.
- `config/initializers` sem lógica pesada ou chamadas externas em boot.

## 8. Estilo (RuboCop)

Se há `.rubocop.yml`, a fonte da verdade é ele — reporte divergências reais,
não gosto pessoal. Se **não** há, recomende adotar `rubocop-rails` +
`rubocop-performance` como melhoria estrutural, mas não trate estilo como
achado de severidade alta.

## 9. Gemfile e dependências

- Gems agrupadas corretamente (`:development`, `:test`).
- Versões travadas onde faz sentido; sem gems abandonadas/duplicadas para a
  mesma função.
- `Gemfile.lock` versionado.

## 10. Documentação mínima

README com setup; decisões não óbvias documentadas. Para uma equipe, a
ausência disso é dívida real — sinalize como BAIXO/MÉDIO.
