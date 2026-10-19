// ─────────────────────────────────────────────────────────────
// plugins/main/ping.js — perintah aktif paling sederhana.
// Cara menonaktifkan: ubah enabled menjadi false.
// Lihat docs/05-plugin-guide.md untuk penjelasan tiap field.
// ─────────────────────────────────────────────────────────────
export default {
  command: ['ping'],
  category: 'main',
  description: 'Cek bot hidup & kecepatan respon',
  usage: '.ping',
  access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
  cooldown: 3,
  enabled: true,

  async run(ctx) {
    const start = Date.now()
    await ctx.react('🏓')
    const elapsed = Date.now() - start
    await ctx.reply(`🏓 *Pong!*\nBot aktif dan merespon dalam ±${elapsed} ms.`)
  }
}
