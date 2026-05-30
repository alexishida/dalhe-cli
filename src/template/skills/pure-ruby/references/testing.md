# Testing Pure Ruby

Default to **Minitest** — it ships with Ruby, so a pure-Ruby project stays dependency-free. Use RSpec only when the user prefers it or the project already uses it.

## Minitest

Two styles. **Assertion style** (`Minitest::Test`) is the most common:

```ruby
# frozen_string_literal: true

require "minitest/autorun"
require_relative "../lib/my_gem/parser"

class ParserTest < Minitest::Test
  def setup
    @parser = MyGem::Parser.new
  end

  def test_parses_valid_input
    result = @parser.parse("a=1")
    assert_equal({ "a" => "1" }, result)
  end

  def test_empty_input_returns_empty_hash
    assert_empty @parser.parse("")
  end

  def test_raises_on_malformed_input
    assert_raises(MyGem::InvalidRow) { @parser.parse("garbage") }
  end

  def test_nil_input_is_rejected
    assert_raises(ArgumentError) { @parser.parse(nil) }
  end
end
```

**Spec style** (`describe`/`it`) reads like RSpec but is still pure Minitest:

```ruby
require "minitest/autorun"

describe MyGem::Parser do
  before { @parser = MyGem::Parser.new }

  it "parses a single pair" do
    _(@parser.parse("a=1")).must_equal({ "a" => "1" })
  end
end
```

Common assertions: `assert`, `refute`, `assert_equal`, `assert_nil`, `assert_empty`, `assert_includes`, `assert_raises`, `assert_in_delta` (floats), `assert_predicate(obj, :valid?)`, `assert_match`.

### Running

```bash
ruby -Itest test/my_gem/parser_test.rb   # one file
rake test                                # whole suite via Rakefile
```

`-Itest` adds `test/` to the load path so `require_relative` and `require` resolve.

## Stubbing and mocking with stdlib

Minitest includes mocking — no extra gem needed.

```ruby
require "minitest/autorun"

class ClientTest < Minitest::Test
  def test_uses_response
    mock = Minitest::Mock.new
    mock.expect(:get, "OK", ["/status"])

    client = Client.new(http: mock)
    assert_equal "OK", client.status

    mock.verify # fails if expected calls didn't happen
  end

  def test_stub_method
    Time.stub(:now, Time.at(0)) do
      assert_equal 0, Clock.epoch
    end
  end
end
```

Prefer **dependency injection** (pass collaborators in) over stubbing globals — it makes tests simpler and the design cleaner.

## RSpec (when requested)

```ruby
# spec/parser_spec.rb
# frozen_string_literal: true

require_relative "../lib/my_gem/parser"

RSpec.describe MyGem::Parser do
  subject(:parser) { described_class.new }

  describe "#parse" do
    it "parses a valid pair" do
      expect(parser.parse("a=1")).to eq("a" => "1")
    end

    it "raises on malformed input" do
      expect { parser.parse("garbage") }.to raise_error(MyGem::InvalidRow)
    end
  end
end
```

Run with `rspec` or `rspec spec/parser_spec.rb`. RSpec needs the gem installed and typically a `.rspec` file with `--require spec_helper`.

## What to test

- The **public** interface, not private methods.
- The happy path, plus every edge you guarded: `nil`, empty, boundary values, malformed input, and the specific exceptions you raise.
- Behavior, not implementation — a refactor that preserves behavior shouldn't break tests.

Keep each test focused on one behavior with a descriptive name so a failure tells you what broke without reading the body.
