# Build & Packaging

Everything beyond `npm run dev`: the Vite config, dev vs. production loading, electron-builder targets, icons, env vars, and distribution.

## Table of contents
1. `electron.vite.config.ts` structure
2. Dev vs. production window loading
3. Scripts in `package.json`
4. `electron-builder.yml` and platform targets
5. Icons and the `resources/` folder
6. Environment variables across processes
7. Auto-update and code signing (pointers)

---

## 1. `electron.vite.config.ts` structure

electron-vite builds three things from one config. Each gets its own Vite/Rollup build with the correct environment:

```ts
import { resolve } from 'node:path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: { input: { index: resolve('src/main/index.ts') } },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: { input: { index: resolve('src/preload/index.ts') } },
    },
  },
  renderer: {
    resolve: {
      alias: { '@renderer': resolve('src/renderer/src') },
    },
    plugins: [react()],
  },
})
```

- `externalizeDepsPlugin()` keeps `node_modules` deps external for main/preload (they run in Node, no need to bundle them). Don't use it for the renderer.
- The renderer section is just a normal Vite config — add Tailwind, SVGR, path aliases, etc. here exactly as you would in a web app.
- Output lands in `out/` (`out/main`, `out/preload`, `out/renderer`). `package.json`'s `"main"` must point to `out/main/index.js`.

## 2. Dev vs. production window loading

The main process loads the renderer differently in dev (HMR dev server) vs. production (built files). electron-vite exposes the dev server URL via an env var:

```ts
import { is } from '@electron-toolkit/utils'

if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
  win.loadURL(process.env['ELECTRON_RENDERER_URL'])
} else {
  win.loadFile(join(__dirname, '../renderer/index.html'))
}
```

`@electron-toolkit/utils` ships with the template and gives you `is.dev`, plus helpers like `electronApp.setAppUserModelId()` and `optimizer.watchWindowShortcuts()`. Keep them.

## 3. Scripts in `package.json`

The template's scripts (adapt names if the user has their own):

```json
{
  "scripts": {
    "dev": "electron-vite dev",
    "build": "npm run typecheck && electron-vite build",
    "typecheck:node": "tsc --noEmit -p tsconfig.node.json --composite false",
    "typecheck:web": "tsc --noEmit -p tsconfig.web.json --composite false",
    "typecheck": "npm run typecheck:node && npm run typecheck:web",
    "build:win": "npm run build && electron-builder --win",
    "build:mac": "npm run build && electron-builder --mac",
    "build:linux": "npm run build && electron-builder --linux"
  }
}
```

Note the **two typecheck passes** — Node env (main + preload) and DOM env (renderer) have different `lib`/globals, so they need separate tsconfigs. Don't collapse them into one.

## 4. `electron-builder.yml` and platform targets

A minimal, multi-platform config:

```yaml
appId: com.example.myapp
productName: My App
directories:
  buildResources: build
files:
  - '!**/.vscode/*'
  - '!src/*'
  - '!electron.vite.config.{js,ts,mjs,cjs}'
  - '!{.eslintrc,.prettierrc,tsconfig*.json}'
asar: true
win:
  target: nsis
  artifactName: ${productName}-${version}-setup.${ext}
mac:
  target: dmg
  category: public.app-category.productivity
linux:
  target:
    - AppImage
    - deb
  category: Utility
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
```

- **`asar: true`** packs your app source into one archive — standard for distribution. Native modules and large binaries can be unpacked via `asarUnpack`.
- Build outputs land in `dist/` by default.
- You can cross-build to a degree, but **macOS builds (and notarization) require macOS**, and Windows code-signing is smoothest on Windows. CI with per-OS runners is the reliable way to ship all three.

## 5. Icons and the `resources/` folder

- App/installer icon: put a high-res PNG (512×512 or 1024×1024) at `build/icon.png`; electron-builder generates platform formats (`.ico`, `.icns`) from it. For best results provide `build/icon.icns` (mac) and `build/icon.ico` (win) explicitly.
- Runtime assets your app reads (tray icons, templates, bundled data) go in `resources/`. Reference them in main with the toolkit helper or `process.resourcesPath` in production vs. a relative path in dev. Add them to electron-builder's `extraResources` if they must sit outside the asar.

## 6. Environment variables across processes

- **Renderer:** use Vite's `import.meta.env`. Only vars prefixed `VITE_` (or `MAIN_VITE_` / `RENDERER_VITE_` / `PRELOAD_VITE_` with electron-vite's prefixing) are exposed. Never put secrets here — the renderer bundle ships to users.
- **Main:** use `process.env` as normal Node. Load a `.env` with `dotenv` if needed, but keep secrets server-side; an Electron app is a client and anything bundled can be extracted.
- electron-vite supports per-process env prefixes so you can scope vars to main/preload/renderer. Check `references` in their docs if a var isn't showing up — prefix is the usual cause.

## 7. Auto-update and code signing (pointers)

- **Auto-update:** `electron-updater` (pairs with electron-builder). Point `publish` in `electron-builder.yml` at GitHub Releases, S3, or a generic server; call `autoUpdater.checkForUpdatesAndNotify()` from main. Push the "update available/downloaded" state to the renderer over IPC (see the `onUpdateAvailable` pattern in the IPC reference).
- **Code signing:** required for a non-scary install/launch experience. Windows: an Authenticode cert (EV recommended to skip SmartScreen warmup). macOS: Apple Developer ID cert **plus notarization** (`afterSign` hook with `@electron/notarize`). Both are best automated in CI. This is environment/credential-specific — guide the user to set the relevant env vars (`CSC_LINK`, `CSC_KEY_PASSWORD`, `APPLE_ID`, etc.) rather than hardcoding anything.

If a packaging step fails, the most common causes are: `"main"` not pointing at `out/main/index.js`, native modules not rebuilt for Electron's ABI (use `@electron/rebuild` or `electron-builder`'s install-app-deps), or missing icons. Check those first.
