// ─── MENU 4: LIST (DAFTAR PILIHAN) ──────────────────────────
// ctx.rich.list({ body, buttonText, sections, variant })
//   sections: ctx.rich.sections() membuatnya otomatis per kategori dari plugin aktif,
//             atau tulis sendiri: [{ title, rows: [{ title, id, description }] }]
//   variant : 'native' (bawaan) atau 'classic' (listMessage resmi). Di sini: .menulist 1 = classic, .menulist 2 = native.
export default {
  command: ['menulist', 'menudaftar'],
  category: 'menu',
  description: 'Contoh menu: list pilihan (.menulist 1/2 = varian)',
  usage: '.menulist 2',
  access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
  cooldown: 5,
  enabled: true,

  async run(ctx) {
    await ctx.rich.list({
      body: 'Buka daftar, lalu pilih perintah yang ingin dijalankan.',
      footer: 'Dibuat otomatis dari plugin aktif',
      buttonText: '📋 Lihat Perintah',
      sections: ctx.rich.sections(),
      variant: Number(ctx.args[0]) === 1 ? 'classic' : 'native'
    })
  }
}
