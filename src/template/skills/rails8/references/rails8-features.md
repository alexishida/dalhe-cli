# Rails 8 Feature Reference

Deeper reference for Rails 8.0/8.1 features. Authoritative source: https://guides.rubyonrails.org/v8.0.0/index.html — fetch the specific guide page when you need exact options.

## Contents
- [The Solid stack (no Redis)](#the-solid-stack-no-redis)
- [Authentication generator](#authentication-generator)
- [Kamal 2 + Thruster + Dockerfile](#kamal-2--thruster--dockerfile)
- [Propshaft + importmap + Hotwire](#propshaft--importmap--hotwire)
- [SQLite in production](#sqlite-in-production)
- [Notable APIs](#notable-apis)
- [Generators cheat sheet](#generators-cheat-sheet)

## The Solid stack (no Redis)

New Rails 8 apps default to database-backed adapters. This removes Redis/Memcached/Sidekiq as required infrastructure for small-to-medium apps.

**Solid Queue** — Active Job backend, runs on your SQL DB. Start the worker with `bin/jobs`. Configure in `config/queue.yml`. Use a separate `queue` database via `config/database.yml` multi-database setup for isolation under load. Define jobs the normal way:

```ruby
class WelcomeEmailJob < ApplicationJob
  queue_as :default
  retry_on Net::SMTPServerBusy, wait: :polynomially_longer, attempts: 5

  def perform(user)
    UserMailer.welcome(user).deliver_now
  end
end
```

Rails 8.1 adds **Active Job Continuations** — long-running jobs can checkpoint progress and resume after interruption, avoiding restarting expensive work.

**Solid Cache** — `Rails.cache` backend stored in the DB (disk is cheaper than RAM, so you can cache far more). Set `config.cache_store = :solid_cache_store`. Standard cache API: `Rails.cache.fetch(key, expires_in: 1.hour) { expensive }`.

**Solid Cable** — Action Cable pub/sub over the DB instead of a Redis adapter. Configured in `config/cable.yml`.

When the project genuinely needs Redis (very high throughput, existing Sidekiq investment), it's fine to swap back — but don't add Redis reflexively.

## Authentication generator

Rails 8 ships a built-in, session-based authentication generator. Prefer it over hand-rolling auth or pulling in Devise unless the app needs Devise-specific features (OmniAuth, confirmable, lockable, etc.).

```bash
bin/rails generate authentication
```

This generates: a `User` model with `has_secure_password`, a `Session` model, `SessionsController`, `PasswordsController`, a `Current` object (`ActiveSupport::CurrentAttributes`) for the logged-in user, an `Authentication` concern included in `ApplicationController`, and a password-reset mailer. It also adds the `bcrypt` gem.

Guard actions with the generated `before_action :require_authentication` and opt specific actions out with `allow_unauthenticated_access only: %i[new create]`.

## Kamal 2 + Thruster + Dockerfile

New apps include a production `Dockerfile`, `config/deploy.yml` (Kamal), and **Thruster** wrapping Puma. Thruster handles HTTP caching, asset compression, and X-Sendfile acceleration, so you usually don't need nginx in front.

```bash
bin/kamal setup     # first deploy: provision + push + boot
bin/kamal deploy    # subsequent zero-downtime deploys
bin/kamal app logs  # tail logs
bin/kamal console   # rails console on the server
```

Secrets live in `.kamal/secrets` (and your env), never committed. `config/deploy.yml` declares servers, the registry, env vars, and accessories (e.g. a Postgres container) when needed.

## Propshaft + importmap + Hotwire

- **Propshaft** is the asset pipeline: it digests and serves assets without transpilation or bundling. No Sprockets manifest. Reference assets with `asset_path`, `image_tag`, `stylesheet_link_tag`.
- **Importmap** maps bare module specifiers to files/CDN URLs without a bundler. Manage with `bin/importmap pin <package>`.
- **Hotwire** = Turbo (Drive, Frames, Streams) + Stimulus. Build interactivity with Turbo Frames/Streams and small Stimulus controllers before reaching for a SPA framework. Opt into a JS bundler only with `rails new --javascript=esbuild` (or `bun`, `webpack`).

## SQLite in production

Rails 8 tuned SQLite for production: WAL mode, sensible busy_timeout, and the Solid adapters can share it. For many internal tools and small/medium apps this is a legitimate production choice that removes a moving part. Use separate SQLite databases for `cache`, `queue`, and `cable` (configured in `database.yml`) so background load doesn't contend with request traffic. Reach for Postgres/MySQL when you need high write concurrency, replication, or DB features SQLite lacks.

## Notable APIs

- **`params.expect`** (Rails 8) — stricter strong-params alternative to `require/permit` that raises a 400 on malformed/tampered params: `params.expect(user: [:name, :email])`.
- **Rate limiting** in controllers: `rate_limit to: 10, within: 1.minute, only: :create`.
- **`ActiveSupport::CurrentAttributes`** (`Current`) — request-scoped globals (current user, request id). Used by the auth generator.
- **Active Record `normalizes`** — declare attribute normalization once: `normalizes :email, with: ->(e) { e.strip.downcase }`.
- **`enum` with keyword syntax** and validations; **`generates_token_for`** for signed, purpose-scoped tokens (password resets, magic links).
- **Structured Event Reporting** (Rails 8.1) — `Rails.event` for structured app events feeding observability tools.

## Generators cheat sheet

```bash
bin/rails new myapp                      # all Rails 8 defaults
bin/rails new myapp -d postgresql        # Postgres instead of SQLite
bin/rails new myapp --javascript=esbuild # JS bundler instead of importmap
bin/rails new myapp --css=tailwind       # Tailwind setup

bin/rails generate authentication        # session-based auth
bin/rails generate model Article title:string body:text published_at:datetime
bin/rails generate migration AddSlugToArticles slug:string:index
bin/rails generate controller Articles index show
bin/rails generate job CleanupExpiredSessions
bin/rails generate mailer UserMailer welcome
bin/rails generate channel Chat
bin/rails generate scaffold Comment article:references body:text
```

Always review generated migrations for: indexes on foreign keys, `null: false` with defaults where appropriate, and reversibility. Run with `bin/rails db:migrate`; check `db/schema.rb` after.
