// ─────────────────────────────────────────────────────────────
// plugins/group/tagall.js — mention semua anggota grup.
// Hanya di grup. Bot memakai metadata grup dari services.group.
// Batasi pemakaian: mention massal terlalu sering bisa dianggap
// spam oleh peserta (dan berisiko pembatasan akun).
// ─────────────────────────────────────────────────────────────
export default {
  command: ['tagall', 'everyone'],
  category: 'group',
  description: 'Mention semua anggota grup',
  usage: '.tagall [pesan pengumuman]',
  access: { owner: false, admin: false, botAdmin: false, group: true, private: false, premium: false, limit: 0 },
  cooldown: 30,
  enabled: true,

  async run(ctx) {
    const meta = await ctx.services.group.getMetadata(ctx.client, ctx.m.chat)
    const participants = ctx.services.group.participants(meta)
    const jids = participants
      .map((p) => ctx.services.group.participantId(p))
      .filter(Boolean)

    if (!jids.length) {
      await ctx.reply('Daftar anggota grup tidak terbaca. Coba lagi sebentar lagi.')
      return
    }
    if (jids.length > 256) {
      await ctx.reply(`Grup ini punya ${jids.length} anggota — terlalu banyak untuk tagall (maks 256 agar tidak dianggap spam).`)
      return
    }

    const announcement = ctx.text || 'Halo semua! 👋'
    const mentionsText = jids.map((jid) => `@${String(jid).split('@')[0]}`).join(' ')
    await ctx.send(ctx.m.chat, {
      type: 'text',
      text: `📣 *Pengumuman*\n${announcement}\n\n${mentionsText}`
    }, { mentions: jids })
  }
}
