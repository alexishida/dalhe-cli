# Clean-Code Patterns — Before / After

Concrete refactors for the principles in SKILL.md. Each shows the smell, names it, and gives the fix. Use these as templates when writing or reviewing Rails 8 code.

## Contents
- [Skinny controller](#skinny-controller)
- [Service object](#service-object)
- [Query object](#query-object)
- [Concern for shared behavior](#concern-for-shared-behavior)
- [Value object with Data.define](#value-object-with-datadefine)
- [Removing a chatty callback](#removing-a-chatty-callback)
- [Fixing N+1 and AR traps](#fixing-n1-and-ar-traps)
- [Small methods, one abstraction](#small-methods-one-abstraction)

## Skinny controller

**Smell:** controller action holds business logic, branching, and multi-model writes.

```ruby
# BEFORE — fat controller
def create
  @order = Order.new(params[:order].permit(:user_id, :total))
  if @order.save
    @order.user.update(last_ordered_at: Time.current)
    OrderMailer.confirmation(@order).deliver_later
    InventoryService.new.decrement(@order)
    redirect_to @order, notice: "Order placed"
  else
    render :new, status: :unprocessable_entity
  end
end
```

```ruby
# AFTER — controller coordinates, service does the work
def create
  result = Orders::Place.new(user: Current.user, params: order_params).call
  if result.success?
    redirect_to result.order, notice: "Order placed"
  else
    @order = result.order
    render :new, status: :unprocessable_entity
  end
end

private

def order_params
  params.expect(order: [:total])
end
```

## Service object

A service object is a plain Ruby class, intention-revealing name, single public `call`. Return a small result object instead of leaking booleans/nils.

```ruby
# app/services/orders/place.rb
module Orders
  class Place
    Result = Data.define(:success?, :order)

    def initialize(user:, params:)
      @user = user
      @params = params
    end

    def call
      order = @user.orders.new(@params)
      ActiveRecord::Base.transaction do
        order.save!
        @user.touch(:last_ordered_at)
        Inventory::Decrement.new(order).call
      end
      OrderMailer.confirmation(order).deliver_later
      Result.new(success?: true, order:)
    rescue ActiveRecord::RecordInvalid
      Result.new(success?: false, order:)
    end
  end
end
```

Keep services side-effect-aware: wrap multi-writes in a transaction, raise inside it so the rollback is automatic, rescue at the boundary.

## Query object

**Smell:** a long, joined scope chain inlined in a controller or scattered across the app.

```ruby
# BEFORE
@articles = Article.where(published: true)
                   .joins(:author)
                   .where(authors: { active: true })
                   .where("published_at > ?", 30.days.ago)
                   .order(published_at: :desc)
```

```ruby
# AFTER — app/queries/recent_published_articles.rb
class RecentPublishedArticles
  def initialize(relation = Article.all, since: 30.days.ago)
    @relation = relation
    @since = since
  end

  def call
    @relation
      .published
      .by_active_authors
      .where(published_at: @since..)
      .order(published_at: :desc)
  end
end

# Article model keeps small, named, composable scopes:
scope :published, -> { where(published: true) }
scope :by_active_authors, -> { joins(:author).merge(Author.active) }
```

## Concern for shared behavior

Extract a cohesive trait shared by multiple models. A concern should represent one capability, not a junk drawer.

```ruby
# app/models/concerns/archivable.rb
module Archivable
  extend ActiveSupport::Concern

  included do
    scope :active,   -> { where(archived_at: nil) }
    scope :archived, -> { where.not(archived_at: nil) }
  end

  def archive! = update!(archived_at: Time.current)
  def archived? = archived_at.present?
end

class Article < ApplicationRecord
  include Archivable
end
```

## Value object with Data.define

Use immutable value objects for domain concepts instead of passing primitives around.

```ruby
Money = Data.define(:cents, :currency) do
  def to_s = format("%.2f %s", cents / 100.0, currency)
  def +(other)
    raise ArgumentError, "currency mismatch" unless currency == other.currency
    with(cents: cents + other.cents)
  end
end

price = Money.new(cents: 1999, currency: "BRL")
price + Money.new(cents: 100, currency: "BRL") # => 20.99 BRL
```

## Removing a chatty callback

**Smell:** an `after_save` callback reaches into other models and external services, making the model hard to test and behavior hard to trace.

```ruby
# BEFORE
class User < ApplicationRecord
  after_create :send_welcome_email, :notify_slack, :seed_default_settings
end
```

```ruby
# AFTER — make the side effects explicit at the call site
class Users::Register
  def initialize(params) = @params = params

  def call
    user = User.create!(@params)
    UserMailer.welcome(user).deliver_later
    Slack::Notify.new(user).call
    Settings.seed_for(user)
    user
  end
end
```

Keep only side-effect-free, in-model massaging as callbacks (or prefer `normalizes`):

```ruby
normalizes :email, with: ->(e) { e.strip.downcase }
```

## Fixing N+1 and AR traps

```ruby
# N+1: one query per article to load author
articles.each { |a| puts a.author.name }          # BEFORE
Article.includes(:author).each { |a| puts a.author.name }  # AFTER

# Booleans: don't instantiate records to ask a yes/no question
User.where(admin: true).any?   # BEFORE — loads records
User.where(admin: true).exists? # AFTER — SELECT 1 LIMIT 1

# Large batches: don't load everything into memory
User.all.each { ... }          # BEFORE
User.find_each { ... }         # AFTER — batches of 1000

# Only need some columns:
User.all.map(&:email)          # BEFORE — full objects
User.pluck(:email)             # AFTER — single column array
```

## Small methods, one abstraction

**Smell:** a method mixes orchestration with low-level detail.

```ruby
# BEFORE
def export
  rows = orders.map do |o|
    [o.id, o.user.name, "%.2f" % (o.cents / 100.0), o.created_at.strftime("%Y-%m-%d")]
  end
  CSV.generate { |csv| rows.each { |r| csv << r } }
end
```

```ruby
# AFTER
def export
  CSV.generate { |csv| orders.each { |order| csv << row_for(order) } }
end

private

def row_for(order)
  [order.id, order.user.name, formatted_total(order), formatted_date(order.created_at)]
end

def formatted_total(order) = format("%.2f", order.cents / 100.0)
def formatted_date(time)   = time.strftime("%Y-%m-%d")
```
