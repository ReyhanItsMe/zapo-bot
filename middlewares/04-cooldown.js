// ─────────────────────────────────────────────────────────────
// 04-cooldown — anti-spam per user per command.
// plugin.cooldown (detik) menentukan jeda minimum. Plugin dengan
// cooldown 0 tidak dicek. Status cooldown disimpan di memori
// (Map di module) — reset saat bot restart, itu disengaja.
// ─────────────────────────────────────────────────────────────
const lastUsed = new Map() // `${sender}|${command}` -> timestamp ms

export default {
  name: 'cooldown',
  async run(ctx, next) {
    // Cooldown butuh plugin terpilih SEBELUM plugin jalan, jadi registry
    // dibaca dari ctx.state.registry (diisi dispatcher). Bila tidak ada,
    // cooldown dilewati dengan aman.
    const registry = ctx.state.registry
    const plugin = registry?.plugins?.get(ctx.command)
    if (!plugin || !plugin.cooldown) { await next(); return }

    const key = `${ctx.m.sender}|${ctx.command}`
    const now = Date.now()
    const waitMs = plugin.cooldown * 1000 - (now - (lastUsed.get(key) || 0))
    if (waitMs > 0) {
      await ctx.reply(`⏳ Tunggu ${Math.ceil(waitMs / 1000)} detik lagi sebelum memakai perintah ini ya.`)
      return
    }
    lastUsed.set(key, now)
    // Cegah Map tumbuh tanpa batas pada bot berumur panjang.
    if (lastUsed.size > 5000) {
      for (const [k, t] of lastUsed) if (now - t > 3_600_000) lastUsed.delete(k)
    }
    await next()
  }
}
