// ─── MENU 6: TEKS + KARTU THUMBNAIL ─────────────────────────
// ctx.rich.ad({ text, title, body, url, thumbnail, variant })
//   url       : URL penuh | nama kunci links ('website', ...) | fungsi (({ links }) => '...')
//               Kosong = config.links.website (bawaan https://zapo.to). Ubah lewat LINK_WEBSITE di .env.
//   thumbnail : nama file di assets/ (bawaan thumb.jpg), path, atau Buffer
//   variant   : 3 (bawaan) | 1 | 2  — di sini: .menuad 1 / 2 / 3
export default {
  command: ['menuad', 'menukartu'],
  category: 'menu',
  description: 'Contoh menu: kartu thumbnail (.menuad 1/2/3 = varian)',
  usage: '.menuad 3',
  access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
  cooldown: 5,
  enabled: true,

  async run(ctx) {
    const requested = Number(ctx.args[0])
    const variant = [1, 2, 3].includes(requested) ? requested : undefined // undefined = bawaan
    await ctx.rich.ad({
      text: ctx.rich.menuText(),
      body: `Contoh kartu thumbnail${variant ? ` (varian ${variant})` : ''}`,
      url: 'website',
      variant
    })
  }
}
