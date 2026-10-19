// ─────────────────────────────────────────────────────────────
// lib/jid.js — helper JID murni (tanpa config / DB).
// WhatsApp memakai beberapa bentuk alamat:
//   62812xxxx@s.whatsapp.net  → user (PN / nomor telepon)
//   123456789@g.us            → grup
//   123456789@lid             → LID (identitas privat, BUKAN nomor)
//   status@broadcast          → status
// PENTING: jangan asumsikan nomor selalu ada di JID — pengirim
// di grup modern sering datang sebagai @lid.
// ─────────────────────────────────────────────────────────────

export const isGroupJid = (jid) => typeof jid === 'string' && jid.endsWith('@g.us')
export const isUserJid = (jid) => typeof jid === 'string' && jid.endsWith('@s.whatsapp.net')
export const isLidJid = (jid) => typeof jid === 'string' && jid.endsWith('@lid')
export const isStatusJid = (jid) => jid === 'status@broadcast'

/** Ambil bagian sebelum '@' (nomor / id grup / id LID). */
export function jidUser(jid) {
  if (typeof jid !== 'string') return ''
  return jid.split('@')[0].split(':')[0] // buang suffix device ":12" bila ada
}

/** Hanya digit dari JID user. Mengembalikan '' untuk LID/grup (memang bukan nomor). */
export function jidNumber(jid) {
  if (!isUserJid(jid)) return ''
  return jidUser(jid).replace(/\D/g, '')
}

/** Normalisasi nomor bebas ("+62 812-xxx", "0812xxx") menjadi digit internasional. */
export function normalizeNumber(input, defaultCountry = '62') {
  let digits = String(input || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('0')) digits = defaultCountry + digits.slice(1)
  return digits
}

/** Bangun JID user dari nomor bebas. */
export function toUserJid(input, defaultCountry = '62') {
  const digits = normalizeNumber(input, defaultCountry)
  return digits ? `${digits}@s.whatsapp.net` : ''
}

/**
 * Kumpulkan semua kandidat identitas dari sebuah event/key agar
 * pencocokan owner/admin tetap akurat walau sender berupa LID.
 * Mengembalikan array unik berisi JID & nomor (bila ada).
 */
export function identityCandidates({ sender, senderAlt, chat, chatAlt } = {}) {
  const out = new Set()
  for (const jid of [sender, senderAlt, chat, chatAlt]) {
    if (typeof jid !== 'string' || !jid) continue
    out.add(jid)
    const num = jidNumber(jid)
    if (num) out.add(num)
    const user = jidUser(jid)
    if (user) out.add(user)
  }
  return [...out]
}

/** True bila salah satu kandidat cocok dengan daftar nomor/JID yang diizinkan. */
export function matchesAny(candidates, allowed) {
  const allowedSet = new Set((allowed || []).map((a) => String(a).replace(/\D/g, '') || String(a)))
  return (candidates || []).some((c) => {
    const raw = String(c)
    if (allowedSet.has(raw)) return true
    const digits = raw.replace(/\D/g, '')
    return digits !== '' && allowedSet.has(digits)
  })
}
