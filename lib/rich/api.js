// ─────────────────────────────────────────────────────────────
// lib/rich/api.js — fasad `ctx.rich`: panggil satu fungsi, isi yang perlu.
//
//   await ctx.rich.ad({ text, title, body, url: 'website' })
//   await ctx.rich.buttons({ body: 'Pilih:', buttons: [{ text: 'Ping', id: '.ping' }] })
//   await ctx.rich.image({ media: 'menu.jpg', caption: ctx.rich.menuText() })
//
// Opsi umum semua fungsi kirim:
//   to        : JID tujuan (bawaan: chat saat ini)
//   quote     : true → membalas (quote) pesan pengirim
//   fallback  : teks cadangan bila semua bentuk gagal / media tidak ada
// Mengembalikan { ok, via } ('main' | 'alternative' | 'text').
// Dokumentasi lengkap: docs/14-rich-api.md
// ─────────────────────────────────────────────────────────────
import { build } from './builders.js'
import { sendBuilt } from './send.js'
import { listSections, menuText } from './text.js'
import { resolveUrl } from './links.js'

const WITH_TITLE = new Set(['buttons', 'list', 'cta', 'interactive', 'ad'])

export function createRichApi(ctx) {
  const env = { links: ctx.config.links || {} }
  const menuList = () => ctx.services?.menu?.list?.() || []

  const api = {
    /** Daftar link bernama dari config/links.js */
    links: env.links,
    /** Resolusi URL: string | nama kunci | fungsi → URL final. */
    url: (input) => resolveUrl(input, env.links),
    /** Teks menu otomatis dari plugin aktif. */
    menuText: (overrides = {}) => menuText({ name: ctx.config.name, prefix: ctx.config.prefix, list: menuList(), ...overrides }),
    /** Section list otomatis per kategori. */
    sections: (overrides = {}) => listSections({ prefix: ctx.config.prefix, list: menuList(), maxRowsPerSection: 8, ...overrides }),
    /** Builder murni (tanpa kirim), sudah terikat env. */
    build: Object.fromEntries(Object.entries(build).map(([k, fn]) => [k, (opts) => fn(opts, env)]))
  }

  for (const name of Object.keys(build)) {
    api[name] = async (opts = {}) => {
      const input = WITH_TITLE.has(name) && opts.title === undefined ? { ...opts, title: ctx.config.name } : opts
      let built
      try {
        built = await build[name](input, env)
      } catch (err) {
        // Gagal membangun (mis. file media tidak ada): pakai teks cadangan bila ada.
        if (opts.fallback) {
          ctx.log?.warn?.(`rich.${name}: ${err?.message || err} — pakai teks cadangan`)
          await ctx.send(opts.to || ctx.m.chat, opts.fallback, opts.quote ? { quote: ctx.event } : undefined)
          return { ok: false, via: 'text' }
        }
        throw err
      }
      return sendBuilt(ctx, built, opts.fallback, { to: opts.to, quote: opts.quote })
    }
  }

  // Alias yang enak dibaca
  api.gif = (opts) => api.video({ ...opts, gif: true })
  api.voice = (opts) => api.audio({ ...opts, voiceNote: true })
  return api
}
