// ─────────────────────────────────────────────────────────────
// 06-limit — kuota harian untuk command ber-limit.
// plugin.access.limit = jumlah kuota yang dipotong per pemakaian
// (0 = gratis). User premium & owner bebas kuota.
// Reset otomatis tengah malam sesuai TIMEZONE di config:
// limit_reset_at menyimpan tanggal lokal (YYYY-MM-DD) terakhir
// kuota dipakai; bila berbeda dari hari ini → kuota di-reset.
// ─────────────────────────────────────────────────────────────
function todayIn(timeZone) {
  // en-CA menghasilkan YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date())
}

export default {
  name: 'limit',
  async run(ctx, next) {
    const plugin = ctx.state.registry?.plugins?.get(ctx.command)
    const cost = Number(plugin?.access?.limit) || 0
    if (!plugin || cost <= 0 || !ctx.config.features.limit || ctx.isOwner || ctx.isPremium) {
      await next(); return
    }

    const today = todayIn(ctx.config.timezone)
    let user = ctx.db.getUser(ctx.m.sender) || ctx.db.ensureUser(ctx.m.sender, ctx.m.pushName)
    if (user.limit_reset_at !== today) {
      user = ctx.db.resetLimit(ctx.m.sender, today)
    }
    const used = Number(user.limit_used) || 0
    if (used + cost > ctx.config.dailyLimit) {
      await ctx.reply(
        `Kuota harian kamu habis (${used}/${ctx.config.dailyLimit}). ` +
        'Kuota reset tengah malam. Mau tanpa batas? Hubungi owner untuk premium ya.'
      )
      return
    }
    ctx.db.addLimitUsed(ctx.m.sender, cost, today)
    await next()
  }
}
