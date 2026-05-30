---
name: rails8
description: Build, refactor, and review Ruby on Rails 8 applications running on Ruby 4 using clean-code best practices. Use this skill whenever the user works with Rails 8.0/8.1 — generating apps, models, controllers, jobs, or migrations; setting up the Rails 8 "Solid" stack (Solid Queue, Solid Cache, Solid Cable), authentication, Kamal deploys, Propshaft, or Turbo/Hotwire; or asking for idiomatic, well-structured, testable Ruby code. Trigger it even when the user only says "Rails", "Ruby on Rails", "Rails app", "ActiveRecord", "Hotwire", "Kamal", or names a Ruby/Rails file, and especially when they mention clean code, refactoring, code review, fat models/skinny controllers, service objects, or test coverage. Prefer this over relying on memory, since Rails 8 changed several defaults (no Redis/Sidekiq required, no Webpacker/Sprockets, built-in auth generator).
---

# Rails 8 + Ruby 4 — Clean Code

Build and review Rails 8 applications that are idiomatic, readable, and maintainable. Rails 8 (8.0 released Nov 2024, 8.1 released Oct 2025) shifted many defaults; this skill encodes those defaults plus the clean-code conventions that keep a Rails codebase healthy as it grows.

The authoritative documentation is the Rails 8.0 guides: https://guides.rubyonrails.org/v8.0.0/index.html — fetch a specific guide page when you need exact API details rather than guessing.

## Environment baseline (verify before generating code)

Rails 8.0 and 8.1 require **Ruby 3.2.0 or newer**. Ruby 4.0 is supported and keeps backward compatibility with the Ruby 3.x line, so 3.x idioms still work — but prefer the modern forms below. Pin both versions explicitly so the project is reproducible:

```ruby
# .ruby-version
4.0.0

# Gemfile
ruby "4.0.0"
gem "rails", "~> 8.1"
```

Run `ruby -v` and `rails -v` (or read the `Gemfile`/`.ruby-version`) to confirm what the project actually uses before writing code. Do not assume — a project may be on 8.0 with Ruby 3.3.

## What changed in Rails 8 (don't carry old habits)

These are the defaults that trip up code written from older muscle memory:

- **No Redis required.** The "Solid" trifecta uses the SQL database instead: **Solid Queue** (Active Job backend, replaces Sidekiq/Resque for most apps), **Solid Cache** (Rails.cache backend, disk-backed, replaces Redis/Memcached), **Solid Cable** (Action Cable backend). New apps get these by default.
- **Propshaft**, not Sprockets, is the default asset pipeline. There is no `app/assets/config/manifest.js` Sprockets ceremony. Don't reach for Webpacker — it's gone.
- **Importmap + Turbo + Stimulus (Hotwire)** is the default frontend. No Node build step unless the user opts into `--javascript=esbuild|bundling`.
- **Built-in authentication generator**: `bin/rails generate authentication` scaffolds a session-based auth system (`User`, `Session`, `has_secure_password`, password reset mailer). Prefer it over hand-rolling auth or adding Devise unless the user needs Devise's feature set.
- **Kamal 2** is the default deploy tool (Docker-based, zero-downtime); a `Dockerfile`, `config/deploy.yml`, and **Thruster** (HTTP proxy for caching/compression/X-Sendfile) ship by default.
- **SQLite is production-viable** in Rails 8 (WAL, tuned defaults) for many small/medium apps. Don't reflexively swap it for Postgres unless the workload calls for it.

Read `references/rails8-features.md` for the deeper feature reference (Solid stack config, Kamal, generators, new APIs).

## Clean-code principles for Rails

Apply these consistently. When reviewing existing code, name the principle being violated and show the refactor.

### Controllers stay skinny
Controllers coordinate; they don't hold business logic. A controller action should read like a short paragraph: find/build, delegate, respond. Push logic into models, query objects, or service objects. Use strong parameters via a private `*_params` method. Favor the standard seven RESTful actions and add new controllers rather than custom actions.

### Models stay focused (fat model ≠ god model)
Logic belongs in models, but a model that does everything is its own smell. Extract cohesive behavior into **concerns** (`app/models/concerns/`) for shared traits, **value objects** for domain concepts, and **service objects** (`app/services/`) for multi-step operations that span models or call external systems. A service object is a plain Ruby class with a single public `call` method and an intention-revealing name (`Orders::Checkout`, `Users::Invite`).

### Query objects for complex scopes
A scope chain longer than a line or two, or one that joins several tables, belongs in a query object (`app/queries/`) or a well-named scope — not inlined in a controller. Keep ActiveRecord scopes small and composable; name them for intent (`scope :active, -> { where(archived_at: nil) }`).

### Naming reveals intent
Methods and variables say what they mean. Predicates end in `?`, dangerous/bang methods in `!`. Avoid abbreviations. A reader should not need the implementation to understand the name. Prefer `overdue?` over `check_date`.

### Small methods, one level of abstraction
Each method does one thing at one level of abstraction. If a method mixes high-level orchestration with low-level detail, extract the detail into a private helper with a descriptive name. Aim for methods that fit on a screen.

### Avoid N+1 and other ActiveRecord traps
Eager-load associations with `includes`/`preload`/`eager_load`. Use `find_each` for large batches. Prefer `exists?` over `present?`/`any?` when you only need a boolean. Use `pluck`/`select` to avoid instantiating full records you won't use. Wrap multi-write operations in transactions. Lean on the `bullet` gem in development to catch N+1s.

### Callbacks sparingly
Callbacks that touch other models or external services make behavior hard to follow and test. Prefer explicit service calls. Reserve callbacks for in-model, side-effect-free data massaging (normalizing a field, setting a default).

### Tests are not optional
Every behavior change ships with a test. Follow the test pyramid: many fast model/unit tests, fewer controller/request tests, a thin layer of system tests for critical flows. Use fixtures or factories, keep tests independent and deterministic, and assert behavior not implementation. Rails 8 ships with the default Minitest setup and parallel test runners; RSpec is fine if the project already uses it.

### Modern Ruby idioms (Ruby 3.2 → 4.0)
Use these where they improve clarity:
- Endless method definitions for one-liners: `def full_name = "#{first} #{last}"`.
- Pattern matching (`case/in`) for structured data and API response handling.
- Keyword arguments over positional for anything with more than one option.
- Hash shorthand: `{ user:, total: }` when the local and key names match.
- `Data.define(...)` for immutable value objects instead of `Struct` when you don't need mutation.
- Safe navigation `&.` instead of nested nil checks.
- Frozen string literals (the default magic comment is added by generators).

See `references/clean-code-patterns.md` for concrete before/after refactors of each principle, and `references/rubocop-config.md` for a starter RuboCop setup (rubocop-rails-omakase is the Rails 8 default style).

## Workflow

When the user asks you to build or change something:

1. **Confirm versions** — read `.ruby-version`/`Gemfile` or ask. Don't generate code for a stack you haven't confirmed.
2. **Use generators** — `bin/rails generate ...` for models, migrations, controllers, mailers, jobs, channels, and authentication. Generators produce the correct Rails 8 file layout and test stubs. Edit the output; don't write boilerplate from scratch.
3. **Run migrations safely** — generate the migration, review it (reversibility, indexes on foreign keys and lookup columns, `null: false` + defaults where appropriate, no data changes mixed with schema changes), then `bin/rails db:migrate`.
4. **Apply the clean-code principles above** as you write — skinny controllers, focused models, extracted services/queries, intention-revealing names, tests alongside code.
5. **Verify** — run the relevant tests and `bin/rubocop` (autocorrect with `bin/rubocop -a` for safe fixes) before declaring done.

When the user asks for a **review or refactor**, read the code, identify which principles are violated, and for each one show the smell, name it, and give the concrete refactor — not vague advice. Prioritize correctness and the highest-leverage changes; don't bikeshed style that RuboCop would handle.

## Reference files

- `references/rails8-features.md` — Rails 8 feature reference: Solid Queue/Cache/Cable setup, Kamal + Thruster deploys, Propshaft/importmap, the authentication generator, SQLite-in-production tuning, and notable new APIs. Read when working with any of these.
- `references/clean-code-patterns.md` — Before/after refactors for each clean-code principle (skinny controller, service object, query object, concern, value object, callback removal, N+1 fixes). Read when writing or reviewing application code.
- `references/rubocop-config.md` — Starter `.rubocop.yml` based on rubocop-rails-omakase plus rationale. Read when setting up linting or resolving style questions.
