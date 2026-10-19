// ─────────────────────────────────────────────────────────────
// core/loader.js — memuat middleware, event handler, dan plugin
// dari folder. Plugin dimuat REKURSIF dari plugins/**.
// Aturan plugin (kontrak bagian 3 di docs/05-plugin-guide.md):
//  - export default objek atau array objek
//  - enabled:false dilewati; file berawalan "_" dilewati
//  - nama command ganda: yang kedua DITOLAK + peringatan
// ─────────────────────────────────────────────────────────────
import { readdir } from 'node:fs/promises'
import { extname, join, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = resolve('.')

async function listJsFiles(dir) {
  const out = []
  let entries = []
  try { entries = await readdir(dir, { withFileTypes: true }) } catch { return out }
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...await listJsFiles(full))
    else if (entry.isFile() && extname(entry.name) === '.js' && !entry.name.startsWith('_')) out.push(full)
  }
  return out
}

export function normalizePlugin(raw, file) {
  if (!raw || typeof raw !== 'object' || typeof raw.run !== 'function') return null
  const commands = (Array.isArray(raw.command) ? raw.command : [raw.command])
    .map((c) => String(c || '').trim().toLowerCase()).filter(Boolean)
  if (!commands.length) return null
  const folder = relative(resolve('plugins'), file).split(sep)[0] || ''
  return {
    command: commands,
    category: raw.category || folder || 'misc',
    description: raw.description || '',
    usage: raw.usage || '',
    access: {
      owner: false, admin: false, botAdmin: false, group: false,
      private: false, premium: false, limit: 0, ...(raw.access || {})
    },
    cooldown: Number(raw.cooldown) || 0,
    enabled: raw.enabled !== false,
    file,
    run: raw.run
  }
}

export function createLoader({ log } = {}) {
  const registry = {
    middlewares: [], // [{ name, run, file }] sudah terurut nama file
    events: [], // [{ name, once, run, file }]
    plugins: new Map(), // command -> plugin
    pluginList: [] // semua plugin terdaftar (untuk menu)
  }

  async function loadMiddlewares() {
    registry.middlewares = []
    const files = await listJsFiles(resolve('middlewares'))
    for (const file of files) {
      const mod = await import(pathToFileURL(file).href)
      const mw = mod.default
      if (mw && typeof mw.run === 'function') {
        registry.middlewares.push({ name: mw.name || relative(ROOT, file), run: mw.run, file })
      } else {
        log?.warn?.(`Middleware dilewati (bentuk tidak valid): ${relative(ROOT, file)}`)
      }
    }
    registry.middlewares.sort((a, b) => a.file.localeCompare(b.file))
    return registry.middlewares
  }

  async function loadEvents() {
    registry.events = []
    const files = await listJsFiles(resolve('events'))
    for (const file of files) {
      const mod = await import(pathToFileURL(file).href)
      const ev = mod.default
      if (ev?.name && typeof ev.run === 'function') {
        registry.events.push({ name: ev.name, once: Boolean(ev.once), run: ev.run, file })
      } else {
        log?.warn?.(`Event dilewati (bentuk tidak valid): ${relative(ROOT, file)}`)
      }
    }
    return registry.events
  }

  async function loadPlugins() {
    registry.plugins = new Map()
    registry.pluginList = []
    const files = await listJsFiles(resolve('plugins'))
    let disabled = 0
    for (const file of files) {
      let mod
      try {
        // Query ?t= memaksa import ulang saat reload() dipanggil.
        mod = await import(`${pathToFileURL(file).href}?t=${Date.now()}`)
      } catch (err) {
        log?.error?.(`Gagal memuat plugin ${relative(ROOT, file)}:`, err?.message || err)
        continue
      }
      const raws = Array.isArray(mod.default) ? mod.default : [mod.default]
      for (const raw of raws) {
        const plugin = normalizePlugin(raw, file)
        if (!plugin) { log?.warn?.(`Plugin dilewati (tidak valid): ${relative(ROOT, file)}`); continue }
        if (!plugin.enabled) { disabled += 1; continue }
        let rejected = false
        for (const cmd of plugin.command) {
          if (registry.plugins.has(cmd)) {
            log?.warn?.(`Command "${cmd}" ganda — ditolak dari ${relative(ROOT, file)} (sudah dipakai ${relative(ROOT, registry.plugins.get(cmd).file)}).`)
            rejected = true
          }
        }
        if (rejected) continue
        for (const cmd of plugin.command) registry.plugins.set(cmd, plugin)
        registry.pluginList.push(plugin)
      }
    }
    return { plugins: registry.plugins, pluginList: registry.pluginList, disabled }
  }

  async function loadAll() {
    await loadMiddlewares()
    await loadEvents()
    const { disabled } = await loadPlugins()
    log?.info?.(`Loader: ${registry.middlewares.length} middleware, ${registry.events.length} event, ${registry.pluginList.length} plugin aktif (${registry.plugins.size} command), ${disabled} plugin nonaktif (enabled:false).`)
    return registry
  }

  /** Muat ulang HANYA plugin (dipakai perintah owner .reload). */
  async function reload() {
    const { disabled } = await loadPlugins()
    log?.info?.(`Reload plugin: ${registry.pluginList.length} plugin aktif, ${disabled} nonaktif.`)
    return registry
  }

  return { registry, loadAll, reload, loadMiddlewares, loadEvents, loadPlugins }
}

export default createLoader
