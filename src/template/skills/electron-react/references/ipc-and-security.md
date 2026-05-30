# IPC & Security

This is the heart of a correct Electron app. Read it before writing or reviewing any code that crosses the main ↔ renderer boundary.

## Table of contents
1. Why the security model matters
2. The required `webPreferences`
3. The typed three-file IPC pattern (full example)
4. Request/response vs. events vs. main→renderer push
5. Validating IPC inputs
6. When you must relax `sandbox` (native modules in preload)
7. Anti-patterns to refuse
8. Bridging IPC to a Zustand store (renderer state)

---

## 1. Why the security model matters

The renderer runs arbitrary web content (your React bundle, but potentially also anything it loads, links to, or that gets injected via an XSS bug). If that context has Node.js access, an attacker who achieves XSS in your renderer immediately gets `require('child_process')` and full code execution on the user's machine. Electron's defaults exist to make that impossible.

The model: **renderer is untrusted, main is trusted, preload is the airlock.** The renderer can only do what the preload explicitly hands it, and the main process validates everything before acting.

## 2. The required `webPreferences`

```ts
import { BrowserWindow } from 'electron'
import { join } from 'node:path'

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,          // renderer runs in an OS sandbox
      contextIsolation: true, // preload & page run in isolated JS contexts
      nodeIntegration: false, // no Node globals (require, process, Buffer) in the page
      webSecurity: true,      // keep same-origin policy on (default; never disable)
    },
  })

  win.on('ready-to-show', () => win.show())
  return win
}
```

- **`contextIsolation: true`** — the preload's `window` and the page's `window` are different objects. The only shared surface is what `contextBridge` exposes. Without this, the page could overwrite preload internals.
- **`nodeIntegration: false`** — no `require`, `process`, `Buffer`, etc. in the renderer.
- **`sandbox: true`** — the renderer process itself is OS-sandboxed. The preload then runs with a reduced Node surface (only `electron` ipcRenderer/contextBridge and a few polyfills). This is the strongest posture.

Also harden navigation: deny `window.open` for untrusted URLs and block in-page navigation to external origins via `webContents.setWindowOpenHandler` and the `will-navigate` event. Load only your own content; open external links in the user's real browser with `shell.openExternal`.

## 3. The typed three-file IPC pattern (full example)

Goal: a renderer call like `const path = await window.api.openFile()` that is fully typed and never exposes raw `ipcRenderer`.

### `src/main/index.ts` — register the handler

```ts
import { app, BrowserWindow, ipcMain, dialog } from 'electron'

ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
  })
  if (canceled) return null
  return filePaths[0]
})

// example with a validated argument
ipcMain.handle('store:set', async (_event, key: unknown, value: unknown) => {
  if (typeof key !== 'string') throw new Error('key must be a string')
  // ...persist value safely...
  return true
})
```

### `src/preload/index.ts` — expose a narrow API

```ts
import { contextBridge, ipcRenderer } from 'electron'

const api = {
  openFile: (): Promise<string | null> => ipcRenderer.invoke('dialog:openFile'),
  setStoreValue: (key: string, value: unknown): Promise<boolean> =>
    ipcRenderer.invoke('store:set', key, value),
  // main → renderer push: wrap the listener, don't leak the event object
  onUpdateAvailable: (cb: (version: string) => void) => {
    const listener = (_e: Electron.IpcRendererEvent, version: string) => cb(version)
    ipcRenderer.on('update:available', listener)
    return () => ipcRenderer.removeListener('update:available', listener)
  },
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('api', api)
} else {
  // only reachable if contextIsolation was (wrongly) turned off
  // @ts-ignore
  window.api = api
}
```

### `src/preload/index.d.ts` — type `window.api`

```ts
export interface ExposedApi {
  openFile: () => Promise<string | null>
  setStoreValue: (key: string, value: unknown) => Promise<boolean>
  onUpdateAvailable: (cb: (version: string) => void) => () => void
}

declare global {
  interface Window {
    api: ExposedApi
  }
}
```

### Renderer call site — fully typed, no Electron knowledge

```tsx
async function handlePick() {
  const path = await window.api.openFile()
  if (path) setSelected(path)
}
```

When you add a new cross-process feature, edit these three files **together**. If the types in `index.d.ts` don't match what preload exposes and what main returns, you have a bug the compiler can't see across the IPC gap — so keep them in lockstep manually.

## 4. Request/response vs. events vs. main→renderer push

- **Request → response (most common):** `ipcMain.handle` + `ipcRenderer.invoke`. Returns a Promise. Use this for "do a thing and tell me the result."
- **Renderer fire-and-forget:** `ipcMain.on` + `ipcRenderer.send`. No return value. Rare; usually you want `invoke`.
- **Main → renderer push:** `webContents.send('channel', payload)` from main, `ipcRenderer.on` in preload (wrapped, as above). For events the main process originates: progress updates, menu actions, update notifications.

Never expose `ipcRenderer.on` directly to the renderer — wrap it so the renderer never touches the raw event object (which carries a `sender` reference).

## 5. Validating IPC inputs

The renderer is the untrusted side. Every argument arriving at an `ipcMain` handler is effectively user input from a potentially-compromised context. Before acting on it:

- Type-check (`typeof`, `Array.isArray`, or a schema lib like `zod`).
- Range/format-check (path is inside an allowed directory, id is a known value, size is bounded).
- Never pass renderer-supplied strings straight into `child_process`, `fs` paths, or shell commands.
- For file operations, resolve and confirm the path stays within an intended base directory (guard against `../` traversal).

```ts
import { z } from 'zod'

const SaveArgs = z.object({ name: z.string().max(255), data: z.string() })

ipcMain.handle('file:save', async (_e, raw: unknown) => {
  const { name, data } = SaveArgs.parse(raw) // throws on bad input
  // ...safe to use name/data...
})
```

## 6. When you must relax `sandbox`

A sandboxed preload can't `require` arbitrary native Node modules. If a preload genuinely needs a native module (rare — usually the work belongs in main instead), you can set `sandbox: false` for that window. If you do:

- Keep `contextIsolation: true` and `nodeIntegration: false` — those stay on regardless.
- Move as much logic as possible into the main process behind IPC, so the preload stays thin.
- Document why sandbox is off in a comment; it's a deviation from the baseline.

Default answer: don't relax it. Put the native work in main and call it over IPC.

## 7. Anti-patterns to refuse (or fix on sight)

- `nodeIntegration: true` in a window that loads remote or substantial local content. → Turn it off; move Node work to main.
- `contextIsolation: false`. → Turn it on; use `contextBridge`.
- Exposing `ipcRenderer` wholesale: `contextBridge.exposeInMainWorld('ipc', ipcRenderer)`. → Expose named operations only.
- A generic bridge: `invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args)`. → This re-opens the whole attack surface; replace with specific functions.
- `webSecurity: false` or `allowRunningInsecureContent: true`. → Never; fix the underlying CORS/mixed-content issue instead.
- Loading untrusted/remote URLs into your main window. → Load only bundled content; use `shell.openExternal` for the web.

If a user asks you to disable these protections to "make it work," explain the risk and offer the IPC-based alternative that achieves the goal safely.

---

## 8. Bridging IPC to a Zustand store (renderer state)

Zustand is the recommended renderer state manager here — it's tiny, hook-based, and needs no provider. In the renderer it behaves exactly like it does in any web app, so there's nothing Electron-specific about `create`, selectors, or actions. **The only Electron-specific concern is the bridge:** how data that lives in the main process (config on disk, results of OS calls, push events) gets into and out of the store. Keep that bridge inside the store's actions so React components stay unaware of IPC entirely — they just read state and call actions.

The pattern has three moves: **hydrate** initial state from main on startup, **persist** mutations back to main, and **subscribe** to main→renderer pushes so the store reflects changes the renderer didn't initiate.

```ts
// src/renderer/src/stores/useSettingsStore.ts
import { create } from 'zustand'

interface SettingsState {
  theme: 'light' | 'dark'
  ready: boolean
  hydrate: () => Promise<void>
  setTheme: (theme: 'light' | 'dark') => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'light',
  ready: false,

  // Pull initial state from the main process exactly once, on app start.
  hydrate: async () => {
    const theme = (await window.api.getStoreValue('theme')) ?? 'light'
    set({ theme, ready: true })
  },

  // Optimistic local update, then persist to main. Roll back on failure.
  setTheme: async (theme) => {
    const prev = get().theme
    set({ theme })
    try {
      await window.api.setStoreValue('theme', theme)
    } catch {
      set({ theme: prev })
    }
  },
}))
```

Hydrate once near the React root (not in every component):

```tsx
// src/renderer/src/main.tsx (or a top-level effect)
useEffect(() => {
  useSettingsStore.getState().hydrate()
}, [])
```

For state the **main process** changes on its own (a watched file updated, a download finished, an auto-update event), wire the preload push listener directly into the store so the store is the single source of truth. Use Zustand's `setState` outside React:

```ts
// register once, e.g. in main.tsx alongside hydrate()
window.api.onUpdateAvailable((version) => {
  useUpdateStore.setState({ updateAvailable: true, version })
})
```

Guidelines specific to this bridge:

- **Actions own the IPC, components don't.** A component calls `setTheme('dark')`; it never calls `window.api` directly. This keeps components portable and testable, and means there's exactly one place per concern where the boundary is crossed.
- **The main process stays authoritative for persisted data.** The Zustand store is a fast in-memory cache of what main holds; on conflict (e.g. a write fails), reconcile toward main's value.
- **Don't try to share one store across processes.** A Zustand store lives in a single JS context. The main process is not a Zustand consumer — it owns the durable data (often via `electron-store` or a file/db) and exposes it over the typed IPC API from sections 3–4. The renderer's store mirrors it.
- **Avoid `zustand/middleware` `persist` with `localStorage` for anything that should survive as real app data.** `localStorage` is fine for trivial UI preferences scoped to the renderer, but durable/app-level state belongs in main behind IPC so it's backed by a real file and survives across windows. Use the hydrate/persist pattern above for those.
- For persistence on the main side, `electron-store` is the common choice: instantiate it in main, and back the `store:get` / `store:set` IPC handlers (section 3) with it. The renderer never imports `electron-store` — it only sees `window.api`.
