// ─── MENU 1: GAMBAR + CAPTION (thumbnail) ───────────────────
// Satu panggilan: ctx.rich.image({ media, caption }).
//   media   : nama file di assets/ (menu.jpg), path, atau Buffer
//   fallback: teks bila file tidak ada / gagal kirim
export default {
  command: ['menuimg', 'menugambar'],
  category: 'menu',
  description: 'Contoh menu: gambar + caption (thumbnail)',
  usage: '.menuimg',
  access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
  cooldown: 5,
  enabled: true,

  async run(ctx) {
    const text = ctx.rich.menuText()
    await ctx.rich.image({ media: 'menu.jpg', caption: text, fallback: text })
  }
}
