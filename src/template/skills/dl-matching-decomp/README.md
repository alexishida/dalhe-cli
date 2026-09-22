# dl-matching-decomp

Portable Agent Skill for **matching decompilation / binary-matching source reconstruction**.

It is intentionally written against the common `SKILL.md` Agent Skills format so the same directory can be used by both OpenAI Codex and Anthropic Claude Code.

## What it does

The skill guides an agent through an authorized reverse-engineering loop:

1. fingerprint the reference binary;
2. infer format/architecture/ABI/toolchain;
3. make candidate builds reproducible;
4. localize mismatches by section/function/offset;
5. reconstruct source conservatively from disassembly/decompiler evidence;
6. iterate compiler/source hypotheses;
7. verify exact bytes and final hash.

The skill explicitly distinguishes **reconstructed source** from the unknowable exact original text when identifiers/comments/macros were not preserved.

## Install in Codex

### Linux/macOS

Project-local:

```bash
mkdir -p .agents/skills
cp -R dl-matching-decomp .agents/skills/
```

User-global:

```bash
mkdir -p ~/.agents/skills
cp -R dl-matching-decomp ~/.agents/skills/
```

Then invoke it explicitly (for example `$dl-matching-decomp`) or describe a dl-matching-decomp task and let Codex select the skill.

### PowerShell

Project-local:

```powershell
New-Item -ItemType Directory -Force .agents\skills | Out-Null
Copy-Item -Recurse dl-matching-decomp .agents\skills\dl-matching-decomp
```

User-global:

```powershell
New-Item -ItemType Directory -Force $HOME\.agents\skills | Out-Null
Copy-Item -Recurse dl-matching-decomp $HOME\.agents\skills\dl-matching-decomp
```

## Install in Claude Code

### Linux/macOS

Project-local:

```bash
mkdir -p .claude/skills
cp -R dl-matching-decomp .claude/skills/
```

User-global:

```bash
mkdir -p ~/.claude/skills
cp -R dl-matching-decomp ~/.claude/skills/
```

### PowerShell

Project-local:

```powershell
New-Item -ItemType Directory -Force .claude\skills | Out-Null
Copy-Item -Recurse dl-matching-decomp .claude\skills\dl-matching-decomp
```

User-global:

```powershell
New-Item -ItemType Directory -Force $HOME\.claude\skills | Out-Null
Copy-Item -Recurse dl-matching-decomp $HOME\.claude\skills\dl-matching-decomp
```

Invoke with:

```text
/dl-matching-decomp
```

or ask Claude to analyze a matching-decompilation/reproducible-binary task.

## claude.ai custom skill

The zip can also be uploaded as a custom skill where that feature is available. The package has a single top-level `dl-matching-decomp/` directory containing `SKILL.md` and its supporting files.

## Included helper scripts

```bash
python dl-matching-decomp/scripts/fingerprint.py reference.bin candidate.bin
python dl-matching-decomp/scripts/compare_binary.py reference.bin candidate.bin
```

`compare_binary.py` exits `0` only for an exact SHA-256 match, which makes it convenient as a build/check step.

## Safety scope

Use only on software/artifacts you are authorized to inspect. The skill is for preservation, interoperability, debugging, migration, research, and legitimate source reconstruction—not for bypassing DRM/access controls, defeating license/authentication mechanisms, credential extraction, or malware development.
