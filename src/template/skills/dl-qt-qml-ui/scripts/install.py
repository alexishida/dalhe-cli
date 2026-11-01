#!/usr/bin/env python3
"""Instala a mesma Agent Skill no Codex, Claude Code e/ou OpenCode.

Exemplos:
  python3 scripts/install.py --agent all --scope project --project /path/to/repo
  python3 scripts/install.py --agent all --scope user
  python3 scripts/install.py --agent opencode --scope user --force
"""
from __future__ import annotations

import argparse
from pathlib import Path
import shutil
import sys

SKILL_NAME = "dl-qt-qml-ui"
SOURCE = Path(__file__).resolve().parent.parent


def destinations(agent: str, scope: str, project: Path) -> list[Path]:
    root = project if scope == "project" else Path.home()
    codex = root / ".agents" / "skills" / SKILL_NAME
    claude = root / ".claude" / "skills" / SKILL_NAME
    opencode = (
        root / ".opencode" / "skills" / SKILL_NAME
        if scope == "project"
        else root / ".config" / "opencode" / "skills" / SKILL_NAME
    )
    # OpenCode also discovers Codex + Claude paths, so no third copy is needed
    # when installing for all three agents. Its scanner can see both paths.
    if agent == "all":
        return [codex, claude]
    return {"codex": [codex], "claude": [claude], "opencode": [opencode]}[agent]


def main() -> int:
    parser = argparse.ArgumentParser(description="Instala dl-qt-qml-ui como Agent Skill")
    parser.add_argument("--agent", choices=["all", "codex", "claude", "opencode"], default="all")
    parser.add_argument("--scope", choices=["project", "user"], default="project")
    parser.add_argument("--project", type=Path, default=Path.cwd(), help="Raiz do repositório (scope=project)")
    parser.add_argument("--force", action="store_true", help="Substitui instalação preexistente")
    args = parser.parse_args()

    if not (SOURCE / "SKILL.md").is_file():
        print("ERRO: SKILL.md não encontrado junto do instalador", file=sys.stderr)
        return 1

    targets = destinations(args.agent, args.scope, args.project.resolve())
    existing = [p for p in targets if p.exists()]
    if existing and not args.force:
        for p in existing:
            print(f"Já existe: {p}", file=sys.stderr)
        print("Use --force para substituí-la de maneira explícita.", file=sys.stderr)
        return 2

    for target in targets:
        if target.resolve() == SOURCE.resolve():
            print(f"SKIP (já é a origem): {target}")
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists():
            if target.is_dir() and not target.is_symlink():
                shutil.rmtree(target)
            else:
                target.unlink()
        shutil.copytree(
            SOURCE, target,
            ignore=shutil.ignore_patterns("__pycache__", "*.pyc", ".DS_Store"),
        )
        print(f"Instalada: {target}")
    if args.agent == "all":
        print("OpenCode encontra a skill nos diretórios compatíveis com Codex/Claude.")
    print("Se o agente já estava aberto e não detectar a skill, reinicie a sessão.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
