# RuboCop Config for Rails 8

Rails 8 generates apps with **rubocop-rails-omakase** — DHH's opinionated, low-friction style preset. Start there and only add cops the team actually wants. Heavy custom configs create churn and arguments; omakase keeps the bikeshedding down.

## Starter `.rubocop.yml`

```yaml
inherit_gem:
  rubocop-rails-omakase: rubocop.yml

require:
  - rubocop-rails
  - rubocop-performance
  - rubocop-minitest   # or rubocop-rspec if the project uses RSpec

AllCops:
  TargetRubyVersion: 4.0
  NewCops: enable
  Exclude:
    - "db/schema.rb"
    - "db/migrate/*"          # generated; don't fight the generator
    - "bin/**/*"
    - "vendor/**/*"
    - "node_modules/**/*"
    - "tmp/**/*"

# A few opinionated additions on top of omakase:
Metrics/MethodLength:
  Max: 15                     # nudge toward small methods
Metrics/ClassLength:
  Max: 150                    # nudge toward extraction (services/queries)
Metrics/AbcSize:
  Max: 20
Rails/SkipsModelValidations:
  Exclude:
    - "db/migrate/*"
```

## Usage

```bash
bin/rubocop            # report offenses
bin/rubocop -a         # autocorrect SAFE offenses only
bin/rubocop -A         # autocorrect ALL (review the diff — -A can change behavior)
bin/rubocop --regenerate-todo   # baseline existing offenses into .rubocop_todo.yml
```

## Guidance

- On an existing codebase, generate a `.rubocop_todo.yml` to baseline current offenses, then fix them incrementally rather than in one giant commit. New code stays clean from day one.
- Don't disable cops inline to silence a real smell — if a method trips `MethodLength`, that's usually the cop telling you to extract. Reserve `# rubocop:disable` for genuine, commented exceptions.
- Run RuboCop in CI alongside the test suite so style and correctness are gated together.
- Keep `TargetRubyVersion` in sync with `.ruby-version` so RuboCop suggests idioms the runtime actually supports (endless methods, pattern matching, `Data.define`, hash shorthand).
