// ─────────────────────────────────────────────────────────────
// 02-parse — mengenali perintah dari teks pesan:
//   ".ping halo dunia" → command="ping", args=["halo","dunia"],
//   text="halo dunia", prefix="."
// Pesan TANPA prefix bukan perintah → alur berhenti (diam).
// Hasil parse disimpan di ctx.state.commandState dan disalin
// dispatcher ke ctx.command/args/text/prefix sebelum plugin jalan.
// Di sini juga user dicatat ke DB (ensureUser) untuk middleware
// berikutnya (ban/limit) — cukup sekali di awal rantai.
// ─────────────────────────────────────────────────────────────
export default {
  name: 'parse',
  async run(ctx, next) {
    const body = (ctx.m.text || '').trim()
    const prefix = ctx.config.prefixes.find((p) => body.startsWith(p))
    if (!prefix) return // bukan perintah

    const withoutPrefix = body.slice(prefix.length).trim()
    if (!withoutPrefix) return // hanya prefix tanpa perintah
    const [rawCommand, ...args] = withoutPrefix.split(/\s+/)

    ctx.state.commandState = {
      command: rawCommand.toLowerCase(),
      args,
      text: args.join(' '),
      prefix
    }
    ctx.command = ctx.state.commandState.command
    ctx.args = args
    ctx.text = ctx.state.commandState.text
    ctx.prefix = prefix

    // Catat user agar ban/premium/limit punya baris di DB.
    try { ctx.db.ensureUser(ctx.m.sender, ctx.m.pushName) } catch (err) {
      ctx.log?.warn?.('ensureUser gagal:', err?.message || err)
    }
    await next()
  }
}
