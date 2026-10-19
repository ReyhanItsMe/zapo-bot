// ─────────────────────────────────────────────────────────────
// 01-ignore-self — abaikan pesan yang tidak perlu diproses:
// pesan dari bot sendiri (fromMe) dan pesan status broadcast.
// Tidak memanggil next() = alur berhenti di sini.
// ─────────────────────────────────────────────────────────────
import { isStatusJid } from '../lib/jid.js'

export default {
  name: 'ignore-self',
  async run(ctx, next) {
    if (ctx.m.fromMe) return // pesan kiriman bot sendiri — abaikan agar tidak loop
    if (isStatusJid(ctx.m.chat)) return // status/story bukan perintah
    if (!ctx.m.text && ctx.m.type === 'unknown') return // pesan kosong/tidak dikenal
    await next()
  }
}
