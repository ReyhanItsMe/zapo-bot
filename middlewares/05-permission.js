// ─────────────────────────────────────────────────────────────
// 05-permission — cek akses plugin (kontrak `access`):
//   group/private : perintah hanya boleh di grup / chat pribadi
//   owner         : hanya owner bot (dari .env OWNER_NUMBERS)
//   admin         : hanya admin grup (bot memuat metadata grup)
//   botAdmin      : bot sendiri harus jadi admin grup
//   premium       : hanya user premium (atau owner)
// Mengisi ctx.isAdmin, ctx.isBotAdmin, ctx.isPremium.
// Penolakan membalas dengan pesan Indonesia yang jelas.
// ─────────────────────────────────────────────────────────────
export default {
  name: 'permission',
  async run(ctx, next) {
    const plugin = ctx.state.registry?.plugins?.get(ctx.command)
    if (!plugin) { await next(); return } // command tak dikenal → dispatcher akan diam

    const access = plugin.access || {}
    const user = ctx.db.getUser(ctx.m.sender)
    ctx.isPremium = Boolean(user?.premium) || ctx.isOwner

    if (access.group && !ctx.isGroup) {
      await ctx.reply('Perintah ini hanya bisa dipakai di dalam grup.')
      return
    }
    if (access.private && ctx.isGroup) {
      await ctx.reply('Perintah ini hanya bisa dipakai di chat pribadi dengan bot.')
      return
    }
    if (access.owner && !ctx.isOwner) {
      await ctx.reply('Perintah ini khusus owner bot.')
      return
    }
    if (access.premium && ctx.config.features.premium && !ctx.isPremium) {
      await ctx.reply('Perintah ini khusus user premium. Hubungi owner untuk info premium ya.')
      return
    }

    if ((access.admin || access.botAdmin) && ctx.isGroup) {
      // Metadata grup dimuat sekali lewat services.group (ada cache singkat).
      try {
        const meta = await ctx.services.group.getMetadata(ctx.client, ctx.m.chat)
        ctx.state.groupMetadata = meta
        ctx.isAdmin = ctx.services.group.isAdmin(meta, ctx.senderCandidates)
        const me = ctx.client.getCredentials?.()?.meJid
        ctx.isBotAdmin = me ? ctx.services.group.isAdmin(meta, [me]) : false
      } catch (err) {
        ctx.log?.warn?.('Gagal memuat metadata grup untuk cek admin:', err?.message || err)
      }
    }
    if (access.admin && !ctx.isAdmin && !ctx.isOwner) {
      await ctx.reply('Perintah ini hanya untuk admin grup.')
      return
    }
    if (access.botAdmin && !ctx.isBotAdmin) {
      await ctx.reply('Jadikan bot sebagai admin grup dulu ya, baru perintah ini bisa jalan.')
      return
    }
    await next()
  }
}
