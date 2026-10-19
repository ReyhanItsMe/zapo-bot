// ─── MENU 5: TOMBOL AKSI (LINK, SALIN, TELEPON) ─────────────
// ctx.rich.cta({ body, buttons }) — tiap tombol salah satu dari:
//   { type:'url',  text, url }   url boleh: URL penuh | nama kunci ('website','support', dari config/links.js) | fungsi
//   { type:'copy', text, code }
//   { type:'call', text, phone }
//   { type:'reply', text, id }
export default {
  command: ['menucta', 'menulink'],
  category: 'menu',
  description: 'Contoh menu: tombol link, salin kode, telepon',
  usage: '.menucta',
  access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
  cooldown: 5,
  enabled: true,

  async run(ctx) {
    await ctx.rich.cta({
      body: 'Contoh tombol aksi: buka website, salin kode promo, atau hubungi admin.',
      footer: 'Ubah di plugins/menu/menu-cta.js dan config/links.js',
      buttons: [
        { type: 'url', text: '🌐 Buka Website', url: 'website' }, // nama kunci → config.links.website
        { type: 'copy', text: '📋 Salin Kode', code: 'PROMO2026' },
        { type: 'call', text: '📞 Hubungi Admin', phone: '+6281234567890' }
      ]
    })
  }
}
