// ─── MENU 3: TOMBOL (QUICK REPLY) ───────────────────────────
// ctx.rich.buttons({ body, footer, buttons: [{ text, id }], variant })
//   id      : kembali sebagai TEKS pesan saat ditekan → isi dengan perintah (mis. '.ping')
//   variant : 'native' (bawaan) atau 'classic' (buttonsMessage resmi). Di sini: .menubtn 1 = classic, .menubtn 2 = native.
export default {
  command: ['menubtn', 'menutombol'],
  category: 'menu',
  description: 'Contoh menu: 3 tombol (.menubtn 1/2 = varian)',
  usage: '.menubtn 2',
  access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
  cooldown: 5,
  enabled: true,

  async run(ctx) {
    await ctx.rich.buttons({
      body: 'Pilih salah satu tombol di bawah ini:',
      footer: 'Tekan tombol untuk menjalankan perintah',
      variant: Number(ctx.args[0]) === 1 ? 'classic' : 'native',
      buttons: [
        { text: '🏓 Ping', id: `${ctx.prefix || ctx.config.prefix}ping` },
        { text: '📋 Menu Teks', id: `${ctx.prefix || ctx.config.prefix}menu` },
        { text: 'ℹ️ Info Bot', id: `${ctx.prefix || ctx.config.prefix}info` }
      ]
    })
  }
}
