// ─────────────────────────────────────────────────────────────
// events/group-update.js — perubahan grup dari zapo-js
// (anggota join/leave, promosi admin, ganti subject, dsb).
// Dipakai fitur welcome/goodbye bila diaktifkan.
//
// TODO(verify): bentuk diskriminator event `group` zapo-js tidak
// ditemukan lengkap di docs yang dibaca (docs/ZAPO-NOTES.md §10).
// Karena itu payload dibaca SANGAT defensif dari banyak kandidat
// field. Bila tidak dikenali, event hanya dicatat di log —
// tidak pernah crash, tidak pernah mengirim pesan salah.
// ─────────────────────────────────────────────────────────────
export default {
  name: 'group',
  once: false,
  async run({ client, app }, event) {
    const { log, config, db } = app
    log?.debug?.('Event grup:', JSON.stringify(event || {}).slice(0, 500))
    if (!config.features.welcome) return

    const groupJid = event?.jid || event?.groupJid || event?.key?.remoteJid || event?.remoteJid
    if (!groupJid || !String(groupJid).endsWith('@g.us')) return
    if (db.getGroupSetting(groupJid, 'welcome', config.features.welcome) !== true) return

    const action = String(event?.action || event?.type || event?.event || '').toLowerCase()
    const participants = event?.participants || event?.participant || event?.users || []
    const list = (Array.isArray(participants) ? participants : [participants])
      .map((p) => (typeof p === 'string' ? p : p?.jid || p?.id))
      .filter(Boolean)
    if (!list.length) return

    // Pola aksi yang umum di library WA: add/remove (Baileys) atau join/leave.
    const isJoin = ['add', 'join', 'joined', 'member_add'].includes(action)
    const isLeave = ['remove', 'leave', 'left', 'member_remove'].includes(action)
    if (!isJoin && !isLeave) return

    let subject = groupJid
    try {
      const meta = await app.services.group.getMetadata(client, groupJid)
      subject = meta?.subject || subject
    } catch { /* sapaan tetap dikirim tanpa nama grup */ }

    for (const jid of list) {
      const number = String(jid).split('@')[0]
      const text = isJoin
        ? `👋 Selamat datang @${number} di *${subject}*! Semoga betah ya.`
        : `👋 Sampai jumpa @${number}, terima kasih sudah mampir di *${subject}*.`
      try {
        await client.message.send(groupJid, { type: 'text', text }, { mentions: [jid] })
      } catch (err) {
        log?.warn?.('Gagal kirim pesan welcome/goodbye:', err?.message || err)
      }
    }
  }
}
