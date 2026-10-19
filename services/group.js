// ─────────────────────────────────────────────────────────────
// services/group.js — operasi grup di atas client.group zapo-js
// (docs/ZAPO-NOTES.md §6) + cache metadata singkat agar cek
// admin beruntun tidak meng-query server berulang kali.
// ─────────────────────────────────────────────────────────────
import { matchesAny, toUserJid } from '../lib/jid.js'

const CACHE_TTL_MS = 30_000

export function createGroupService({ log } = {}) {
  const cache = new Map() // groupJid -> { at, meta }

  function participantId(p) {
    // TODO(verify): field id peserta WaGroupParticipant zapo-js — dibaca defensif.
    return p?.jid || p?.id || p?.lid || p?.phoneNumber || ''
  }

  return {
    async getMetadata(client, groupJid, { fresh = false } = {}) {
      const hit = cache.get(groupJid)
      if (!fresh && hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.meta
      const meta = await client.group.queryGroupMetadata(groupJid)
      cache.set(groupJid, { at: Date.now(), meta })
      return meta
    },
    invalidate(groupJid) { cache.delete(groupJid) },
    participants(meta) { return Array.isArray(meta?.participants) ? meta.participants : [] },
    participantId,
    /** True bila salah satu kandidat adalah admin/superadmin grup. */
    isAdmin(meta, candidates) {
      const parts = this.participants(meta)
      return parts.some((p) => (p?.isAdmin || p?.isSuperAdmin) && matchesAny([participantId(p)], candidates))
    },
    findParticipant(meta, candidates) {
      return this.participants(meta).find((p) => matchesAny([participantId(p)], candidates)) || null
    },
    async add(client, groupJid, inputs) {
      const jids = inputs.map((n) => toUserJid(n)).filter(Boolean)
      const results = await client.group.addParticipants(groupJid, jids)
      this.invalidate(groupJid)
      return results
    },
    async remove(client, groupJid, inputs) {
      const jids = inputs.map((n) => toUserJid(n)).filter(Boolean)
      const results = await client.group.removeParticipants(groupJid, jids)
      this.invalidate(groupJid)
      return results
    },
    async promote(client, groupJid, inputs) {
      const jids = inputs.map((n) => toUserJid(n)).filter(Boolean)
      const results = await client.group.promoteParticipants(groupJid, jids)
      this.invalidate(groupJid)
      return results
    },
    async demote(client, groupJid, inputs) {
      const jids = inputs.map((n) => toUserJid(n)).filter(Boolean)
      const results = await client.group.demoteParticipants(groupJid, jids)
      this.invalidate(groupJid)
      return results
    },
    /** Ringkas hasil per-JID dari zapo-js menjadi teks Indonesia. */
    summarizeResults(results) {
      if (!Array.isArray(results)) return ''
      return results.map((r) => {
        const num = String(r?.jid || r?.phoneNumber || '').split('@')[0]
        if (r?.status === 'ok' || r?.code === 200) return `✅ ${num} berhasil`
        const reason = { 403: 'ditolak privasi user', 408: 'tidak diizinkan', 409: 'sudah anggota/admin', 404: 'nomor tidak terdaftar di WhatsApp' }[r?.code] || `kode ${r?.code ?? '?'}`
        return `❌ ${num} gagal (${reason})`
      }).join('\n')
    },
    log
  }
}

export default createGroupService
