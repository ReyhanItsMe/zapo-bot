// ─────────────────────────────────────────────────────────────
// 03-ban-check — user yang dibanned owner tidak dilayani.
// Owner sendiri tidak pernah ter-ban lewat middleware ini.
// ─────────────────────────────────────────────────────────────
export default {
  name: 'ban-check',
  async run(ctx, next) {
    if (ctx.isOwner) { await next(); return }
    const user = ctx.db.getUser(ctx.m.sender)
    if (user?.banned) return // diam: tidak membalas user ter-banned
    await next()
  }
}
