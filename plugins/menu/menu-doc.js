// ─── MENU 2: DOKUMEN "PALSU" ────────────────────────────────
// Menu dikirim sebagai lampiran PDF (assets/menu.pdf) dengan caption daftar perintah.
// ctx.rich.document({ media, fileName, mimetype, caption })
export default {
  command: ['menudoc', 'menudokumen'],
  category: 'menu',
  description: 'Contoh menu: dokumen palsu (PDF) + caption',
  usage: '.menudoc',
  access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
  cooldown: 5,
  enabled: true,

  async run(ctx) {
    const text = ctx.rich.menuText()
    await ctx.rich.document({
      media: 'menu.pdf',
      fileName: `${ctx.config.name} - Menu.pdf`,
      caption: text,
      fallback: text
    })
  }
}
