// ─── MENU 7: VIDEO / GIF + CAPTION ──────────────────────────
// ctx.rich.gif({ media, caption }) = video yang diputar otomatis seperti GIF.
// Pakai ctx.rich.video({ ..., gif: false }) untuk video biasa.
export default {
  command: ['menugif', 'menuvideo'],
  category: 'menu',
  description: 'Contoh menu: video/GIF + caption',
  usage: '.menugif',
  access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
  cooldown: 8,
  enabled: true,

  async run(ctx) {
    const text = ctx.rich.menuText()
    await ctx.rich.gif({ media: 'menu.mp4', caption: text, fallback: text })
  }
}
