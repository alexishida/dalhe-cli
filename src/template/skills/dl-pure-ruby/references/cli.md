# Building CLIs in Pure Ruby

Use `optparse` from the standard library. It handles `--long`/`-s` flags, type coercion, defaults, and `--help` generation. Don't hand-parse `ARGV` for anything beyond a single positional argument.

## Single-command CLI

```ruby
#!/usr/bin/env ruby
# frozen_string_literal: true

require "optparse"

options = { verbose: false, count: 1 }

parser = OptionParser.new do |opts|
  opts.banner = "Usage: greet [options] NAME"

  opts.on("-c", "--count N", Integer, "Repeat N times (default 1)") do |n|
    options[:count] = n
  end

  opts.on("-v", "--verbose", "Print extra detail") do
    options[:verbose] = true
  end

  opts.on("-h", "--help", "Show this help") do
    puts opts
    exit
  end
end

parser.parse!(ARGV) # mutates ARGV, leaving positional args

name = ARGV.shift or abort parser.banner # abort -> stderr + exit 1

warn "greeting #{name} #{options[:count]}x" if options[:verbose]
options[:count].times { puts "Hello, #{name}!" }
```

Key points:
- `parse!` removes recognized flags from `ARGV`, leaving positionals.
- `abort(msg)` prints to **stderr** and exits with status 1 — the correct failure path for CLIs.
- Type coercion (`Integer`, `Float`, `Array`) is built in; OptionParser raises `OptionParser::InvalidArgument` on bad input.
- Make the file executable (`chmod +x`) and use the `env` shebang.

## Subcommands (git-style)

Split `ARGV` into the subcommand and the rest, then dispatch:

```ruby
#!/usr/bin/env ruby
# frozen_string_literal: true

require "optparse"

COMMANDS = %w[add list remove].freeze

command = ARGV.shift

case command
when "add"    then run_add(ARGV)
when "list"   then run_list(ARGV)
when "remove" then run_remove(ARGV)
when nil, "-h", "--help"
  puts "Usage: todo <#{COMMANDS.join('|')}> [options]"
else
  abort "Unknown command: #{command.inspect}. Expected one of #{COMMANDS.join(', ')}."
end
```

Each `run_*` method builds its own `OptionParser` scoped to that subcommand.

## Reading from stdin

Support piping so the tool composes with others. Treat `-` or absent argument as "read stdin":

```ruby
input = if ARGV.empty? || ARGV.first == "-"
          $stdin.read
        else
          File.read(ARGV.first)
        end
```

## Exit codes and signals

- `0` success, non-zero failure. `abort` gives you `1`; use `exit(2)` etc. for distinct failure modes if the user cares.
- Wrap the body in a rescue for expected errors and `warn` a clean message instead of dumping a backtrace:

```ruby
begin
  main(options)
rescue MyTool::Error => e
  abort "error: #{e.message}"
rescue Interrupt
  warn "\ninterrupted"
  exit 130 # conventional code for SIGINT
end
```

Print user-facing errors to stderr (`warn`/`$stderr.puts`), data output to stdout (`puts`), so redirection and piping behave.
