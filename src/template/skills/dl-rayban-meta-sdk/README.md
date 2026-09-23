# dl-rayban-meta-sdk — Ray-Ban Meta SDK Skill

Skill/plugin portátil para desenvolvimento de software para a família de óculos de IA da Meta, com foco no **Meta Wearables Device Access Toolkit (DAT)** e no caminho **Web Apps para Meta Ray-Ban Display**.

> Snapshot de referências: 2026-09-22. A skill foi desenhada para consultar documentação ao vivo antes de assumir versões ou APIs.

## O que ela sabe fazer

- Escolher o caminho correto por dispositivo e tipo de app.
- Criar/integrar apps Android com Kotlin + DAT.
- Criar/integrar apps iOS com Swift/SwiftUI + DAT.
- Trabalhar com câmera, streaming, captura de foto, sessão e registro.
- Tratar áudio sem inventar módulos/API: verificar documentação atual e usar os perfis/superfícies oficialmente suportados.
- Criar experiências de display e Web Apps **somente quando o hardware tiver display**.
- Usar MockDeviceKit quando não houver óculos físicos.
- Diagnosticar Developer Mode, registro, permissões, sessão e stream.
- Considerar privacidade, analytics/crash reporting e limitações de Developer Preview.
- Consultar o MCP público oficial da Meta quando disponível.

## Instalação rápida

Descompacte o ZIP, entre na pasta e execute:

```bash
./install.sh claude
./install.sh codex
```

Para instalar nos dois CLIs disponíveis:

```bash
./install.sh all
```

No Windows PowerShell:

```powershell
./install.ps1 claude
./install.ps1 codex
# ou
./install.ps1 all
```

Também é possível instalar diretamente:

```bash
claude plugin install ./plugins/rayban-meta-sdk
codex plugin install ./plugins/rayban-meta-sdk
```

## Uso

Depois de instalada, peça normalmente ao agente, por exemplo:

```text
Crie um app Android que conecte ao meu Ray-Ban Meta, mostre preview da câmera no celular e capture uma foto ao tocar em um botão.
```

```text
Adicione suporte do Meta Wearables DAT a este projeto iOS existente. Preserve minha arquitetura e implemente registro, sessão, câmera e tratamento de erros.
```

```text
Quero um app para Meta Ray-Ban Display com uma lista navegável pelo D-pad. Decida se é melhor DAT nativo ou Web App e implemente a opção adequada.
```

## MCP oficial recomendado

Quando o ambiente suportar MCP, conecte:

```text
https://mcp.developer.meta.com/wearables
```

Ferramentas documentadas pela Meta:

- `search_dat_docs` — Device Access Toolkit.
- `search_webapps_docs` — Web Apps para Display.

O endpoint público não exige token/OAuth segundo a documentação oficial consultada na data do snapshot.

## Compatibilidade com Ray-Ban Meta Gen 1

A skill **não trata todo Ray-Ban Meta como se tivesse display**. O Ray-Ban Meta
Gen 1 funciona no caminho móvel do Meta Wearables Device Access Toolkit (DAT),
com câmera como capacidade inicialmente documentada. Microfone e alto-falantes
seguem o caminho Bluetooth do iOS/Android e devem ser confirmados na
documentação atual. Ele não suporta display nem Wearables Web Apps, que são
específicos ao Meta Ray-Ban Display.

O uso exige os pré-requisitos atuais da Meta, incluindo pareamento com o app
Meta AI, Developer Mode e elegibilidade de país/conta para as capacidades
completas do toolkit. Veja `references/gen1-compatibility.md` e confirme a
documentação oficial antes de prometer uma capacidade ou distribuição.

## Estrutura

```text
plugins/rayban-meta-sdk/
  .claude-plugin/plugin.json
  .codex-plugin/plugin.json
  skills/
    rayban-meta-sdk/
    dat-android/
    dat-ios/
    display-webapps/
    camera-audio-ai/
    testing-debugging/
    privacy-release/
  references/
    official-sources.md
    capability-matrix.md
```

## Fontes

Veja `plugins/rayban-meta-sdk/references/official-sources.md`.

## Licença

MIT para esta skill original. Os SDKs, documentação e marcas da Meta continuam sujeitos aos termos/licenças dos respectivos proprietários.
