// ─────────────────────────────────────────────────────────────
// core/dispatcher.js — alur satu pesan masuk:
//   serialize → ctx → rantai middleware → plugin.run(ctx)
// Middleware yang tidak memanggil next() menghentikan alur.
// Error plugin: detail ke log, pengguna menerima pesan ramah.
// ─────────────────────────────────────────────────────────────
import { serializeMessage } from '../lib/serialize.js'
import { createContext } from './context.js'

const FRIENDLY_ERROR = 'Maaf, terjadi kesalahan saat menjalankan perintah itu. Coba lagi sebentar lagi ya.'

export function createDispatcher({ client, config, db, services, queue, log, registry }) {
  async function dispatch(event) {
    const m = serializeMessage(event)
    if (!m.chat) return { handled: false, reason: 'no-chat' }

    const ctx = createContext({
      client, event, m, config, db, services, queue, log,
      commandState: { command: '', args: [], text: '', prefix: '' }
    })
    // Dibaca middleware 02-parse; disimpan di ctx.state agar ctx tetap sesuai kontrak.
    ctx.state.commandState = { command: '', args: [], text: '', prefix: '' }
    ctx.state.registry = registry // dipakai middleware 04/05/06 untuk mencari plugin terpilih

    const chain = [...(registry?.middlewares || [])]
    let plugin = null

    const runPlugin = async () => {
      const state = ctx.state.commandState
      ctx.command = state.command; ctx.args = state.args; ctx.text = state.text; ctx.prefix = state.prefix
      plugin = registry?.plugins?.get(state.command) || null
      if (!plugin) return // bukan command yang dikenal → diam (bukan error)
      try {
        await plugin.run(ctx)
      } catch (err) {
        log?.error?.(`Error plugin "${state.command}" (${plugin.file}):`, err)
        try { await ctx.reply(FRIENDLY_ERROR) } catch { /* pengiriman pesan error pun gagal — sudah terlog */ }
      }
    }

    let index = -1
    const next = async () => {
      index += 1
      if (index < chain.length) {
        const mw = chain[index]
        try {
          await mw.run(ctx, next)
        } catch (err) {
          log?.error?.(`Error middleware "${mw.name}":`, err)
          try { await ctx.reply(FRIENDLY_ERROR) } catch { /* abaikan */ }
        }
        return
      }
      await runPlugin()
    }

    await next()
    return { handled: Boolean(plugin), command: ctx.command, plugin }
  }

  return { dispatch }
}

export default createDispatcher
