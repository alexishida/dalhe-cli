#!/usr/bin/env python3
"""Verificação estática e sem dependências extras da distribuição da skill."""
from pathlib import Path
import re
import sys

root = Path(__file__).resolve().parent.parent
content = (root / "SKILL.md").read_text(encoding="utf-8")
errors = []

if not content.startswith("---\n") or content.count("\n---\n") < 1:
    errors.append("Frontmatter YAML ausente")
else:
    metadata = content.split("---\n", 2)[1]
    for key in ("name", "description"):
        if not re.search(rf"(?m)^{key}:\s*\S", metadata):
            errors.append(f"Frontmatter sem {key}")
    if not re.search(r"(?m)^name:\s*dl-qt-qml-ui\s*$", metadata):
        errors.append("Nome não corresponde à pasta")

for link in re.findall(r"\]\((references/[^)]+|assets/[^)]+)\)", content):
    if not (root / link).exists():
        errors.append(f"Link local quebrado: {link}")

for file in (
    "references/design-language.md", "references/qml-implementation.md",
    "references/quality-gates.md", "assets/starter/CMakeLists.txt",
    "assets/starter/main.cpp", "assets/starter/Main.qml",
    "assets/starter/Theme.qml", "assets/starter/UiButton.qml",
    "assets/starter/UiNavItem.qml", "assets/starter/UiStatCard.qml",
):
    if not (root / file).is_file():
        errors.append(f"Arquivo ausente: {file}")

if errors:
    print("FALHOU:\n- " + "\n- ".join(errors), file=sys.stderr)
    raise SystemExit(1)
print("OK: metadados, referências e exemplos presentes")
