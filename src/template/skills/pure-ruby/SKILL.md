---
name: pure-ruby
description: Write clean, idiomatic, dependency-free Ruby such as plain scripts, CLI tools, libraries, and gems using only the standard library. Use this skill whenever the user is writing Ruby outside of a web framework, including command-line utilities, automation scripts, data-processing tasks, algorithms, parsers, gems, or any ".rb" file where Rails, Sinatra, or Hanami is NOT involved. Trigger it even when the user just says "write a Ruby script", "make a CLI in Ruby", "refactor this Ruby class", or pastes plain Ruby and asks for help, since the goal is stdlib-only, framework-free Ruby done the idiomatic way. Do NOT use for Rails-specific work like ActiveRecord, controllers, or migrations, which belong to a Rails skill.
---

# Pure Ruby

Guidance for writing clean, idiomatic Ruby using only the language and its standard library — no Rails, no third-party runtime dependencies unless the user explicitly asks. The aim is code that reads well, fails loudly when it should, and would pass review by an experienced Rubyist.

## When you start

Before writing code, settle three things (ask only if the conversation doesn't already answer them):

1. **Ruby version.** Default to the modern stable line (3.x) and use its features freely (endless methods, pattern matching, `Data.define`, `it` block param in 3.4+). If the user is locked to an older version, scale back accordingly.
2. **Deliverable shape.** A throwaway script, a reusable library file, a CLI tool, or a full gem? This decides the structure (see "Structuring code" below).
3. **Dependencies.** Pure Ruby means stdlib-only by default. Reach for `optparse`, `json`, `set`, `csv`, `net/http`, `fileutils`, `tempfile`, `logger`, `pp` before considering a gem. If a gem genuinely helps, name it and say why.

## Core idioms

These are the habits that separate idiomatic Ruby from Ruby-written-like-another-language.

**Prefer enumerables over manual loops.** Reach for `map`, `select`, `reject`, `reduce`, `each_with_object`, `group_by`, `partition`, `tally`, `sum`, `min_by`, `flat_map` instead of building arrays with index counters. Chain them when it stays readable; break the chain into named intermediate variables when it doesn't.

**Use blocks and yield for resource safety.** Anything that opens must close. Pass a block and guarantee cleanup with `ensure`, mirroring `File.open`:

```ruby
def with_connection(addr)
  conn = Connection.open(addr)
  yield conn
ensure
  conn&.close
end
```

**Let truthiness and safe navigation do the work.** Only `nil` and `false` are falsy. Use `&.` to chain through possibly-nil receivers, `||=` for memoization, and `fetch` (not `[]`) when a missing key is a bug you want surfaced.

**Guard clauses over nested conditionals.** Return or raise early; keep the happy path un-indented.

```ruby
def process(order)
  raise ArgumentError, "order required" if order.nil?
  return :skipped unless order.payable?

  charge(order)
end
```

**Symbols for identifiers, strings for data.** Hash keys that are fixed labels are symbols; text that came from or goes to the outside world is a string. Freeze string literals (`# frozen_string_literal: true` at the top of every file).

**Embrace expressiveness, but not cleverness.** Metaprogramming (`define_method`, `method_missing` + `respond_to_missing?`, `Comparable`/`Enumerable` mixins) is a tool, not a flex. Use it when it removes real duplication; otherwise write the plain method. If `method_missing` is defined, `respond_to_missing?` must be too.

## Structuring code

Match the structure to the deliverable:

- **Script (single task):** A `# frozen_string_literal: true` magic comment, requires, then code. Wrap the entry point in `if __FILE__ == $PROGRAM_NAME` so the file can also be required without side effects.
- **CLI tool:** Parse args with `OptionParser` from `optparse` (stdlib) — never hand-roll `ARGV` parsing for anything non-trivial. Put the logic in a class/method and keep `OptionParser` thin. See `references/cli.md` for a complete pattern.
- **Library:** One top-level module as a namespace, classes inside it, one class per file under `lib/`, `require_relative` to wire them. Define a `VERSION` constant.
- **Gem:** Standard layout (`lib/`, `test/` or `spec/`, `.gemspec`, `Gemfile`). See `references/gems.md`.

Keep classes small and single-purpose. Prefer composition over deep inheritance. Use `Struct` or `Data.define` (3.2+) for plain value objects instead of writing boilerplate attribute classes:

```ruby
Point = Data.define(:x, :y) do
  def distance_to(other) = Math.hypot(x - other.x, y - other.y)
end
```

## Errors and edge cases

Define a small exception hierarchy rooted at `StandardError` (never rescue `Exception` — that swallows `Interrupt` and `SystemExit`). Rescue the narrowest class that makes sense, and rescue *something specific* rather than a bare `rescue`. Use `ensure` for cleanup, and re-raise (`raise` with no args) if you only needed to observe the error.

```ruby
module Importer
  class Error < StandardError; end
  class InvalidRow < Error; end
end
```

Validate inputs at the boundary and raise `ArgumentError`/`KeyError` with a message that says what was expected and what was received.

## Testing

Default to **Minitest** (stdlib — no extra dependency) unless the user prefers RSpec. Write tests for public behavior, not private methods. Cover the happy path plus the edge cases you guarded against (nil, empty, boundary values, malformed input). See `references/testing.md` for Minitest and RSpec patterns and a sample run command.

## Style and verification

Follow community conventions: 2-space indent, `snake_case` for methods/variables, `CamelCase` for classes/modules, `SCREAMING_SNAKE_CASE` for constants, `?`/`!` suffixes for predicates/bang methods. Lines under ~100 chars.

When the environment allows, verify before delivering:

```bash
ruby -c file.rb          # syntax check
ruby -w file.rb          # run with warnings enabled
rubocop file.rb          # if available; otherwise note conventions followed
ruby -Itest test/foo_test.rb   # run the tests
```

If RuboCop isn't installed, don't block on it — just write code that would pass a sane default config, and mention that running `rubocop` is recommended.

## Output expectations

- Every `.rb` file opens with `# frozen_string_literal: true`.
- Provide runnable code with the requires it actually needs — no missing `require`.
- For libraries/gems, include the directory layout so the user knows where each file goes.
- Include tests when the user asks for them or when the code is non-trivial enough that they obviously help; otherwise offer to add them.
- Explain non-obvious idioms briefly in prose or a short comment — but don't over-comment self-evident code.

## Reference files

Read these as needed; don't load them upfront:

- `references/cli.md` — Complete `OptionParser` CLI pattern with subcommands, exit codes, and stdin handling.
- `references/gems.md` — Gem layout, `.gemspec`, versioning, and bundler-free workflows.
- `references/testing.md` — Minitest and RSpec templates, fixtures, mocking with stdlib, and test running.
