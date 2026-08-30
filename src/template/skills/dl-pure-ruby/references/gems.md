# Authoring a Pure-Ruby Gem

A gem needs very little: a `lib/` tree, a `.gemspec`, and a version constant. Bundler's `bundle gem NAME` scaffolds all of this, but you can also hand-build it.

## Layout

```
my_gem/
├── lib/
│   ├── my_gem.rb            # requires the pieces, defines top-level module
│   └── my_gem/
│       ├── version.rb       # MyGem::VERSION
│       └── parser.rb        # one class per file
├── test/                    # or spec/ for RSpec
│   └── my_gem/
│       └── parser_test.rb
├── my_gem.gemspec
├── Gemfile
├── Rakefile
└── README.md
```

## version.rb

```ruby
# frozen_string_literal: true

module MyGem
  VERSION = "0.1.0"
end
```

Follow semantic versioning: `MAJOR.MINOR.PATCH`. Bump PATCH for fixes, MINOR for backward-compatible features, MAJOR for breaking changes.

## Entry file (lib/my_gem.rb)

```ruby
# frozen_string_literal: true

require_relative "my_gem/version"
require_relative "my_gem/parser"

module MyGem
  class Error < StandardError; end
  # public API can live here or be delegated to classes above
end
```

Use `require_relative` for files inside your own gem; reserve `require` for stdlib and external gems.

## my_gem.gemspec

```ruby
# frozen_string_literal: true

require_relative "lib/my_gem/version"

Gem::Specification.new do |spec|
  spec.name        = "my_gem"
  spec.version     = MyGem::VERSION
  spec.authors     = ["Your Name"]
  spec.email       = ["you@example.com"]
  spec.summary     = "One-line description."
  spec.description = "A longer description of what the gem does."
  spec.homepage    = "https://example.com/my_gem"
  spec.license     = "MIT"
  spec.required_ruby_version = ">= 3.1"

  spec.files = Dir["lib/**/*.rb", "README.md", "LICENSE.txt"]
  spec.require_paths = ["lib"]

  # Runtime deps (keep minimal — pure Ruby aims for zero):
  # spec.add_dependency "some_gem", "~> 2.0"

  # Dev deps go in the Gemfile or here as development dependencies:
  spec.add_development_dependency "minitest", "~> 5.0"
  spec.add_development_dependency "rake", "~> 13.0"
end
```

The `~>` ("pessimistic") operator: `~> 5.0` allows `>= 5.0, < 6.0`. Use it to accept compatible updates without surprise breaks.

## Gemfile

```ruby
# frozen_string_literal: true

source "https://rubygems.org"
gemspec # pulls deps from the .gemspec
```

## Rakefile (test task)

```ruby
# frozen_string_literal: true

require "rake/testtask"

Rake::TestTask.new(:test) do |t|
  t.libs << "test"
  t.test_files = FileList["test/**/*_test.rb"]
end

task default: :test
```

## Build, test, install locally

```bash
gem build my_gem.gemspec        # produces my_gem-0.1.0.gem
gem install ./my_gem-0.1.0.gem  # install locally to try it
rake test                       # run the suite
```

Publishing (`gem push my_gem-0.1.0.gem`) requires a RubyGems account — only mention it if the user is actually releasing.

## Zero-dependency discipline

For a "pure Ruby" gem, keep `add_dependency` empty. Lean on the stdlib (`json`, `set`, `csv`, `uri`, `net/http`, `digest`, `securerandom`, `fileutils`). If you must add a runtime dependency, justify it and pin it with `~>`.
