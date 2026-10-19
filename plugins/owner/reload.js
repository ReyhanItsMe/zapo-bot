// ─────────────────────────────────────────────────────────────
// plugins/owner/reload.js — muat ulang plugin TANPA restart bot.
// Khusus owner. Loader diteruskan main.js lewat services.menu.reload
// (keputusan desain, lihat menu.js & main.js).
// ─────────────────────────────────────────────────────────────
export default {
  command: ['reload'],
  category: 'owner',
  description: 'Muat ulang semua plugin dari folder plugins/',
  usage: '.reload',
  access: { owner: true, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
  cooldown: 5,
  enabled: true,

  async run(ctx) {
    if (typeof ctx.services.menu?.reload !== 'function') {
      await ctx.reply('Fitur reload tidak terhubung di instalasi ini. Restart bot untuk memuat ulang plugin.')
      return
    }
    const before = ctx.services.menu.list().length
    const registry = await ctx.services.menu.reload()
    const after = registry.pluginList?.length ?? ctx.services.menu.list().length
    await ctx.reply(`✅ Plugin dimuat ulang. Sebelum: ${before} plugin aktif → sesudah: ${after} plugin aktif.`)
  }
}
