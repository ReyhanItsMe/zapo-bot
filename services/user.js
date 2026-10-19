// ─────────────────────────────────────────────────────────────
// services/user.js — logika user yang dipakai banyak plugin:
// profil gabungan (DB + config owner), ban, premium, sisa limit.
// ─────────────────────────────────────────────────────────────
import { identityCandidates, matchesAny, normalizeNumber, toUserJid } from '../lib/jid.js'

export function createUserService({ db, config }) {
  return {
    /** Pastikan user ada di DB lalu kembalikan barisnya. */
    ensure(jid, name = '') {
      return db.ensureUser(jid, name)
    },
    isOwnerCandidates(candidates) {
      return matchesAny(candidates, config.owners)
    },
    /** Cari user dari nomor/JID bebas. Mengembalikan baris DB atau null. */
    find(input) {
      const jid = toUserJid(input) || input
      return db.getUser(jid) || db.getUser(toUserJid(normalizeNumber(input)))
    },
    ban(input) {
      const jid = toUserJid(input)
      if (!jid) return null
      return db.setBanned(jid, true)
    },
    unban(input) {
      const jid = toUserJid(input)
      if (!jid) return null
      return db.setBanned(jid, false)
    },
    setPremium(input, premium) {
      const jid = toUserJid(input)
      if (!jid) return null
      return db.setPremium(jid, premium)
    },
    /** Ringkasan limit user untuk hari ini (tanpa mengubah DB). */
    limitInfo(jid) {
      const today = new Intl.DateTimeFormat('en-CA', {
        timeZone: config.timezone, year: 'numeric', month: '2-digit', day: '2-digit'
      }).format(new Date())
      const user = db.getUser(jid)
      const used = user && user.limit_reset_at === today ? Number(user.limit_used) || 0 : 0
      return { used, total: config.dailyLimit, remaining: Math.max(0, config.dailyLimit - used), today }
    },
    candidatesFor(m) {
      return identityCandidates({ sender: m?.sender, senderAlt: m?.senderAlt, chat: m?.chat, chatAlt: m?.chatAlt })
    }
  }
}

export default createUserService
