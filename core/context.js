// ─────────────────────────────────────────────────────────────
// core/context.js — membangun objek `ctx` untuk plugin.
// Kontrak ctx (docs/05-plugin-guide.md):
//   client, event, m, command, args, text, prefix,
//   config, db, services, reply(), send(), react(), rich, log,
//   isOwner, isAdmin, isBotAdmin, isPremium, isGroup
// ─────────────────────────────────────────────────────────────
import { identityCandidates, matchesAny } from '../lib/jid.js'
import { createRichApi } from '../lib/rich/index.js'

export function createContext({ client, event, m, config, db, services, queue, log, commandState }) {
  const senderCandidates = identityCandidates({
    sender: m.sender, senderAlt: m.senderAlt, chat: m.isGroup ? undefined : m.chat, chatAlt: m.chatAlt
  })
  const isOwner = matchesAny(senderCandidates, config.owners)

  const ctx = {
    client,
    event,
    m,
    command: commandState?.command || '',
    args: commandState?.args || [],
    text: commandState?.text || '',
    prefix: commandState?.prefix || '',
    config,
    db,
    services,
    log,
    isOwner,
    // Diisi middleware 05-permission setelah metadata grup dimuat:
    isAdmin: false,
    isBotAdmin: false,
    isPremium: false,
    isGroup: m.isGroup,
    senderCandidates,
    state: {}, // kantong bebas antar-middleware dalam satu pesan

    /** Balas ke chat yang sama (melewati antrean kirim anti-spam). */
    reply(content, options) {
      return queue.send(m.chat, content, { quote: event, ...(options || {}) })
    },
    /** Kirim ke JID mana pun (melewati antrean kirim). */
    send(jid, content, options) {
      return queue.send(jid, content, options)
    },
    /** Beri reaksi emoji ke pesan ini. */
    async react(emoji) {
      // TODO(verify): bentuk content reaksi zapo-js ({ type:'reaction', ... }) belum terkonfirmasi.
      // Implementasi aman: coba typed content, fallback raw proto reactionMessage.
      try {
        return await queue.send(m.chat, { type: 'reaction', emoji, key: m.key })
      } catch {
        return queue.send(m.chat, {
          reactionMessage: { key: m.key, text: emoji, senderTimestampMs: Date.now() }
        })
      }
    }
  }
  // Fungsi menu/pesan kaya: ctx.rich.ad(), .buttons(), .list(), .cta(), .image(), ... (docs/14-rich-api.md)
  ctx.rich = createRichApi(ctx)
  return ctx
}

export default createContext
