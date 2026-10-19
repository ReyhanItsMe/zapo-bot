// ─────────────────────────────────────────────────────────────
// lib/serialize.js — ubah event mentah zapo-js menjadi objek `m`
// yang enak dipakai plugin. Lihat docs/ZAPO-NOTES.md §4–§5.
// Fungsi murni: tidak membaca config / DB.
//
// Bentuk event yang diasumsikan (dari docs Zapo):
//   event = {
//     key: { remoteJid, remoteJidAlt?, id, fromMe?, participant?, participantAlt? },
//     message: { conversation | extendedTextMessage | imageMessage | ... },
//     pushName?, messageTimestamp?
//   }
// Field Alt (LID↔PN) dibaca defensif — lihat TODO(verify) di bawah.
// ─────────────────────────────────────────────────────────────
import { isGroupJid, jidNumber, jidUser } from './jid.js'

function firstContextInfo(message) {
  if (!message || typeof message !== 'object') return null
  for (const value of Object.values(message)) {
    if (value && typeof value === 'object' && value.contextInfo) return value.contextInfo
  }
  return null
}

/**
 * Balasan tombol/list → teks. `id` tombol dibaca sebagai teks pesan, jadi id
 * yang berisi perintah (mis. ".ping") otomatis dijalankan seolah diketik user.
 * TODO(verify): nama field respons di payload zapo-js (mengikuti proto WhatsApp).
 */
function extractInteractiveReply(message) {
  const flow = message.interactiveResponseMessage?.nativeFlowResponseMessage
  if (flow?.paramsJson) {
    try {
      const parsed = JSON.parse(flow.paramsJson)
      const id = parsed?.id ?? parsed?.selectedId ?? parsed?.display_text
      if (typeof id === 'string' && id) return id
    } catch { /* abaikan JSON rusak */ }
  }
  return (
    message.buttonsResponseMessage?.selectedButtonId ||
    message.listResponseMessage?.singleSelectReply?.selectedRowId ||
    message.templateButtonReplyMessage?.selectedId ||
    message.interactiveResponseMessage?.body?.text ||
    ''
  )
}

function extractText(message) {
  if (!message || typeof message !== 'object') return ''
  const reply = extractInteractiveReply(message)
  if (reply) return reply
  if (typeof message.conversation === 'string') return message.conversation
  if (typeof message.extendedTextMessage?.text === 'string') return message.extendedTextMessage.text
  for (const key of ['imageMessage', 'videoMessage', 'documentMessage', 'audioMessage', 'stickerMessage']) {
    if (typeof message[key]?.caption === 'string') return message[key].caption
  }
  return ''
}

function detectType(message) {
  if (!message || typeof message !== 'object') return 'unknown'
  const keys = Object.keys(message)
  const map = {
    conversation: 'text', extendedTextMessage: 'text',
    imageMessage: 'image', videoMessage: 'video', audioMessage: 'audio',
    documentMessage: 'document', stickerMessage: 'sticker',
    reactionMessage: 'reaction', pollCreationMessage: 'poll',
    pollUpdateMessage: 'pollVote', protocolMessage: 'protocol',
    interactiveResponseMessage: 'buttonReply', buttonsResponseMessage: 'buttonReply',
    listResponseMessage: 'buttonReply', templateButtonReplyMessage: 'buttonReply',
    locationMessage: 'location', contactMessage: 'contact', contactsArrayMessage: 'contacts'
  }
  for (const key of keys) if (map[key]) return map[key]
  return keys[0] ? keys[0].replace(/Message$/, '') : 'unknown'
}

function serializeQuoted(message, key) {
  const ctxInfo = firstContextInfo(message)
  const quotedMessage = ctxInfo?.quotedMessage
  if (!quotedMessage) return null
  // TODO(verify): field stanzaId/participant pada contextInfo zapo-js — dibaca defensif dari beberapa nama.
  const quotedId = ctxInfo.stanzaId || ctxInfo.stanza_id || null
  const quotedSender = ctxInfo.participant || ctxInfo.remoteJid || key?.remoteJid || null
  return {
    id: quotedId,
    sender: quotedSender,
    senderNumber: jidNumber(quotedSender || ''),
    type: detectType(quotedMessage),
    text: extractText(quotedMessage),
    message: quotedMessage,
    key: quotedId ? { remoteJid: key?.remoteJid, id: quotedId, participant: quotedSender } : null
  }
}

/**
 * Serialize satu event pesan masuk menjadi objek `m`.
 * Aman menerima event palsu/parsial (untuk pengujian) — field yang
 * tidak ada diisi nilai default, tidak pernah throw.
 */
export function serializeMessage(event) {
  const raw = event || {}
  const key = raw.key || {}
  const message = raw.message || raw.msg || null

  // TODO(verify): nama field Alt zapo-js (`remoteJidAlt`/`participantAlt`) — dibaca dari beberapa kandidat.
  const chat = key.remoteJid || raw.remoteJid || ''
  const chatAlt = key.remoteJidAlt || key.remote_jid_alt || raw.remoteJidAlt || null
  const isGroup = isGroupJid(chat)
  const sender = (isGroup ? (key.participant || key.participantAlt || chat) : chat) || ''
  const senderAlt = key.participantAlt || key.remoteJidAlt || chatAlt || null

  const ctxInfo = firstContextInfo(message)
  const mentions = Array.isArray(ctxInfo?.mentionedJid) ? ctxInfo.mentionedJid : []

  const tsRaw = raw.messageTimestamp ?? raw.timestamp ?? key.timestamp
  const timestamp = typeof tsRaw === 'number'
    ? (tsRaw > 1e12 ? tsRaw : tsRaw * 1000)
    : (tsRaw ? Number(tsRaw) * 1000 || Date.now() : Date.now())

  return {
    raw,
    key,
    id: key.id || raw.id || '',
    chat,
    chatAlt,
    sender,
    senderAlt,
    senderNumber: jidNumber(sender) || jidNumber(senderAlt || ''),
    senderId: jidUser(sender),
    pushName: raw.pushName || raw.notify || '',
    isGroup,
    fromMe: Boolean(key.fromMe ?? raw.fromMe),
    type: detectType(message),
    text: extractText(message),
    body: extractText(message),
    message,
    quoted: serializeQuoted(message, key),
    mentions,
    isReaction: detectType(message) === 'reaction',
    timestamp
  }
}

export default serializeMessage
