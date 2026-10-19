// ─────────────────────────────────────────────────────────────
// plugins/main/info.js — info sesi pengirim & status limit.
// Mencontohkan pemakaian services.user dan ctx.isPremium.
// ─────────────────────────────────────────────────────────────
export default {
  command: ['info', 'me'],
  category: 'main',
  description: 'Lihat info akunmu di bot ini (status, limit)',
  usage: '.info',
  access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
  cooldown: 5,
  enabled: true,

  async run(ctx) {
    const user = ctx.db.ensureUser(ctx.m.sender, ctx.m.pushName)
    const limit = ctx.services.user.limitInfo(ctx.m.sender)
    const lines = [
      '*Info Akun Kamu*',
      `Nama: ${ctx.m.pushName || user?.name || '-'}`,
      `Nomor/ID: ${ctx.m.senderNumber || ctx.m.senderId || '-'}`,
      `Status: ${ctx.isOwner ? 'Owner 👑' : ctx.isPremium ? 'Premium ⭐' : 'Pengguna biasa'}`,
      `Limit hari ini: ${ctx.isPremium || ctx.isOwner ? 'tanpa batas' : `${limit.used}/${limit.total} terpakai (sisa ${limit.remaining})`}`,
      `Terdaftar sejak: ${user?.created_at || '-'}`
    ]
    await ctx.reply(lines.join('\n'))
  }
}
