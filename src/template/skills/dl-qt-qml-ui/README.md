# dl-qt-qml-ui

**Agent Skill portátil** para Codex, Claude Code e OpenCode. Ensina os agentes a desenhar e implementar interfaces **Qt 6 / Qt Quick / QML** com acabamento profissional, navegação fluida e componentes consistentes — **sem depender de HTML ou WebView**.

## O que vem neste pacote

- `SKILL.md`: instruções que os agentes carregam automaticamente quando a tarefa envolve QML/UI desktop.
- `references/design-language.md`: direção estética, paletas dark/light, ritmo de espaçamento, UX.
- `references/qml-implementation.md`: arquitetura Qt Quick Controls e boas práticas Qt 6.
- `references/quality-gates.md`: critérios de aceite e verificações técnicas.
- `assets/starter/`: exemplo CMake/C++/QML **Qt 6.5+** com sidebar, cards, gráfico ilustrativo, navegação real, controle de tema e motion.
- `scripts/install.py`: instalação nos diretórios descobertos pelos agentes.
- `scripts/validate.py`: verificação estática mínima.

## Instalar em um projeto (Linux/macOS/Windows com Python)

Extraia o ZIP e execute **a partir da pasta extraída**:

```bash
python3 dl-qt-qml-ui/scripts/install.py --agent all --scope project --project /caminho/do/projeto
```

No Windows, pode ser `py` em vez de `python3`.

O instalador usa dois caminhos para três agentes:

| Agente | Caminho no projeto |
|---|---|
| Codex | `.agents/skills/dl-qt-qml-ui/SKILL.md` |
| Claude Code | `.claude/skills/dl-qt-qml-ui/SKILL.md` |
| OpenCode | Lê os dois caminhos anteriores (compatibilidade nativa); opcionalmente `.opencode/skills/dl-qt-qml-ui/SKILL.md` |

O OpenCode pode identificar a mesma skill nos dois caminhos em um projeto compartilhado. Se isso causar duplicação na seleção, instale o OpenCode isoladamente no caminho `.opencode/skills` apenas nos projetos em que não estiver usando os outros agentes.

### Instalar globalmente (para todos os seus repositórios)

```bash
python3 dl-qt-qml-ui/scripts/install.py --agent all --scope user
```

Com isso, Codex encontra em `~/.agents/skills/`, Claude Code em `~/.claude/skills/` e OpenCode também consegue descobrir a skill via esses diretórios. Para instalar só um agente, use `--agent codex`, `--agent claude` ou `--agent opencode`; o último usa `.opencode/skills/` no projeto ou `~/.config/opencode/skills/` em nível global.

Se o destino já existir, o instalador não sobrescreve sem `--force`.

## Uso

- **Codex:** `$dl-qt-qml-ui Refaça a tela de configurações em QML como um app desktop moderno...`
- **Claude Code:** `/dl-qt-qml-ui Crie uma sidebar e um tema dark/light...`
- **OpenCode:** `Use a skill dl-qt-qml-ui para modernizar minha interface QML.`

Os agentes podem também carregar a skill automaticamente conforme a descrição no frontmatter.

## Rodar o exemplo

```bash
cd dl-qt-qml-ui/assets/starter
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build
```

Requer Qt 6.5+ com Quick + Quick Controls e um compilador C++17. O template ilustra design, não representa dados reais.

## Verificar o pacote

```bash
python3 dl-qt-qml-ui/scripts/validate.py
```

## Fontes oficiais

- Codex Agent Skills: https://learn.chatgpt.com/docs/build-skills
- Claude Code skills: https://code.claude.com/docs/en/skills
- OpenCode skills: https://opencode.ai/docs/skills
- Qt Quick boas práticas: https://doc.qt.io/qt-6/qtquick-bestpractices.html
- Qt Quick Controls styling: https://doc.qt.io/qt-6/qtquickcontrols-customize.html
- QML singletons: https://doc.qt.io/qt-6/qml-singleton.html

Licença: MIT, texto da skill e código do starter.
