// ─────────────────────────────────────────────────────────────
// plugins/main/menu.js — menu otomatis dari registry plugin.
// Menu TIDAK ditulis manual: setiap plugin aktif yang punya
// description otomatis muncul, dikelompokkan per kategori.
// Tambah plugin baru → menu langsung ter-update.
// Registry diterima lewat parameter kedua? Tidak — kontrak ctx
// tidak memuat registry. Karena itu menu memakai daftar yang
// di-inject main.js ke services.menu (lihat main.js & KNOWN-ISSUES:
// keputusan desain — registry diteruskan via services).
// ─────────────────────────────────────────────────────────────
import { formatDateTime, greeting } from '../../lib/format.js'

export default {
  command: ['menu', 'help'],
  category: 'main',
  description: 'Tampilkan daftar perintah bot',
  usage: '.menu',
  access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
  cooldown: 5,
  enabled: true,

  async run(ctx) {
    const list = ctx.services.menu?.list?.() || []
    const byCategory = new Map()
    for (const plugin of list) {
      const cat = plugin.category || 'misc'
      if (!byCategory.has(cat)) byCategory.set(cat, [])
      byCategory.get(cat).push(plugin)
    }

    const name = ctx.m.pushName || 'Kak'
    const lines = [
      `${greeting(ctx.config.timezone)}, ${name}! 👋`,
      `Saya *${ctx.config.name}* — asisten WhatsApp kamu.`,
      `🕐 ${formatDateTime(new Date(), ctx.config.timezone)}`,
      ''
    ]
    if (!list.length) lines.push('Belum ada perintah aktif selain menu ini.')
    for (const [category, plugins] of [...byCategory.entries()].sort()) {
      lines.push(`*${category.toUpperCase()}*`)
      for (const plugin of plugins) {
        const cmds = plugin.command.map((c) => `${ctx.config.prefix}${c}`).join(' / ')
        lines.push(`• ${cmds} — ${plugin.description}`)
        if (plugin.usage) lines.push(`  ↳ contoh: ${plugin.usage}`)
      }
      lines.push('')
    }
    lines.push(`Ketik perintah diawali "${ctx.config.prefix}", contoh: ${ctx.config.prefix}ping`)
    await ctx.reply(lines.join('\n').trim())
  }
}
