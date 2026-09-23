param(
  [ValidateSet("claude", "codex", "all")]
  [string]$Mode = "all"
)

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$PluginDir = Join-Path $Root "plugins/rayban-meta-sdk"

function Install-Claude {
  if (Get-Command claude -ErrorAction SilentlyContinue) {
    & claude plugin install $PluginDir
    if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar no Claude Code." }
    Write-Host "Ray-Ban Meta SDK instalado no Claude Code."
  } else {
    Write-Warning "Claude CLI não encontrado; pulando."
  }
}

function Install-Codex {
  if (Get-Command codex -ErrorAction SilentlyContinue) {
    & codex plugin install $PluginDir
    if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar no Codex." }
    Write-Host "Ray-Ban Meta SDK instalado no Codex."
  } else {
    Write-Warning "Codex CLI não encontrado; pulando."
  }
}

switch ($Mode) {
  "claude" { Install-Claude }
  "codex" { Install-Codex }
  "all" { Install-Claude; Install-Codex }
}
