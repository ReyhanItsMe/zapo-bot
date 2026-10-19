// ─────────────────────────────────────────────────────────────
// plugins/owner/ban.js — ban / unban user. Khusus owner.
// User yang ter-ban diabaikan total oleh middleware 03-ban-check.
// Cara pakai: .ban 62812xxxx  |  .unban 62812xxxx
// Bisa juga dengan mention: .ban @user (nomor terbaca dari mention
// bila tersedia dalam bentuk JID user).
// ─────────────────────────────────────────────────────────────
import { normalizeNumber } from '../../lib/jid.js'

function targetNumber(ctx) {
  const mention = (ctx.m.mentions || []).find((j) => String(j).endsWith('@s.whatsapp.net'))
  if (mention) return String(mention).split('@')[0]
  return normalizeNumber(ctx.args[0] || '')
}

export default [
  {
    command: ['ban'],
    category: 'owner',
    description: 'Blokir user agar tidak bisa memakai bot',
    usage: '.ban 62812xxxx',
    access: { owner: true, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 3,
    enabled: true,
    async run(ctx) {
      const number = targetNumber(ctx)
      if (!number) {
        await ctx.reply('Format salah. Contoh: .ban 6281234567890 (atau mention user-nya).')
        return
      }
      if (ctx.config.owners.includes(number)) {
        await ctx.reply('Tidak bisa mem-ban owner bot sendiri.')
        return
      }
      const user = ctx.services.user.ban(number)
      await ctx.reply(user ? `🚫 User ${number} sudah diblokir. Dia tidak akan dilayani bot lagi.` : 'Gagal memblokir user itu. Periksa format nomornya.')
    }
  },
  {
    command: ['unban'],
    category: 'owner',
    description: 'Buka blokir user',
    usage: '.unban 62812xxxx',
    access: { owner: true, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 3,
    enabled: true,
    async run(ctx) {
      const number = targetNumber(ctx)
      if (!number) {
        await ctx.reply('Format salah. Contoh: .unban 6281234567890')
        return
      }
      const user = ctx.services.user.unban(number)
      await ctx.reply(user ? `✅ Blokir user ${number} sudah dibuka.` : 'Gagal membuka blokir. Periksa format nomornya.')
    }
  }
]
