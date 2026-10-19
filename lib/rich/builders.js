// ─────────────────────────────────────────────────────────────
// lib/rich/builders.js — PEMBUAT PESAN (murni, tidak mengirim apa pun).
// Setiap fungsi `build.xxx(opsi, env)` mengembalikan:
//   { content, options?, alternatives?, fallbackText? }
//     content       → argumen ke-2 client.message.send()
//     options       → argumen ke-3 (mentions, viewOnce, contextInfo, ...)
//     alternatives  → bentuk cadangan yang dicoba bila `content` ditolak
//     fallbackText  → teks biasa bila semua bentuk gagal
// `env` = { links } dari config. Biasanya kamu memakai ctx.rich.xxx() yang
// memanggil builder lalu mengirimnya; pakai build.xxx langsung bila ingin
// membangun pesan sendiri (mis. untuk broadcast).
// Semua fungsi async: gunakan `await`.
// ─────────────────────────────────────────────────────────────
import { resolveMedia, toBuffer } from './assets.js'
import { resolveUrl } from './links.js'
import { btn, buildButtonsMessage, buildInteractive, buildListMessage } from './native.js'

/** Nilai bawaan yang boleh diubah pembeli. */
export const DEFAULTS = {
  adVariant: 3, // varian kartu bawaan (1/2/3, lihat build.ad)
  thumbnail: 'thumb.jpg' // thumbnail bawaan kartu
}

const clean = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))
const pick = (value, map, fallback) => map[String(value).toLowerCase()] ?? fallback
const digits = (v) => String(v ?? '').replace(/\D/g, '')

/** Hasil untuk pesan native flow: bentuk terbungkus dulu, lalu polos. */
function nativeResult(opts, fallbackText) {
  return {
    content: buildInteractive({ ...opts, wrap: true }),
    alternatives: [{ content: buildInteractive({ ...opts, wrap: false }) }],
    fallbackText
  }
}

export const build = {
  // ── Teks & media (tipe bawaan zapo-js, terdokumentasi) ─────
  /** { text, mentions?: string[], linkPreview?: boolean|{title,description} } */
  async text({ text = '', mentions, linkPreview } = {}) {
    return {
      content: clean({ type: 'text', text, linkPreview }),
      options: mentions?.length ? { mentions } : undefined,
      fallbackText: text
    }
  },

  /** { media, caption?, mimetype?, viewOnce? } — media: nama file di assets/, path, Buffer */
  async image({ media, caption, mimetype = 'image/jpeg', viewOnce } = {}) {
    return {
      content: clean({ type: 'image', media: resolveMedia(media), mimetype, caption }),
      options: viewOnce ? { viewOnce: true } : undefined,
      fallbackText: caption
    }
  },

  /** { media, caption?, mimetype?, gif? } — gif:true diputar otomatis seperti GIF */
  async video({ media, caption, mimetype = 'video/mp4', gif = false, viewOnce } = {}) {
    return {
      content: clean({ type: 'video', media: resolveMedia(media), mimetype, caption, gifPlayback: gif || undefined }),
      options: viewOnce ? { viewOnce: true } : undefined,
      fallbackText: caption
    }
  },

  /** { media, mimetype?, voiceNote? } — voiceNote:true tampil sebagai voice note */
  async audio({ media, mimetype, voiceNote = false } = {}) {
    return {
      content: clean({
        type: 'audio',
        media: resolveMedia(media),
        mimetype: mimetype || (voiceNote ? 'audio/ogg; codecs=opus' : 'audio/mpeg'), // TODO(verify): mimetype voice note
        ptt: voiceNote || undefined
      })
    }
  },

  /** { media, fileName?, mimetype?, caption? } */
  async document({ media, fileName, mimetype = 'application/pdf', caption } = {}) {
    return {
      content: clean({ type: 'document', media: resolveMedia(media), mimetype, fileName, caption }),
      fallbackText: caption
    }
  },

  /** { media } — file .webp */
  async sticker({ media } = {}) {
    return { content: { type: 'sticker', media: resolveMedia(media) } }
  },

  // ── Raw proto resmi (docs zapo: guides/raw-sends) ──────────
  /** { latitude, longitude, name?, address? } */
  async location({ latitude, longitude, name, address } = {}) {
    return {
      content: { locationMessage: clean({ degreesLatitude: Number(latitude), degreesLongitude: Number(longitude), name, address }) },
      fallbackText: `📍 ${name || 'Lokasi'}${address ? `\n${address}` : ''}\nhttps://maps.google.com/?q=${latitude},${longitude}`
    }
  },

  /** { name, number, organization? } — number: digit internasional tanpa + (62812…) */
  async contact({ name, number, organization } = {}) {
    const wa = digits(number)
    const vcard = [
      'BEGIN:VCARD', 'VERSION:3.0', `FN:${name}`,
      organization ? `ORG:${organization}` : null,
      `TEL;type=CELL;type=VOICE;waid=${wa}:+${wa}`,
      'END:VCARD'
    ].filter(Boolean).join('\n')
    return { content: { contactMessage: { displayName: name, vcard } }, fallbackText: `${name}: +${wa}` }
  },

  /** { name?, list: [{ name, number, organization? }] } */
  async contacts({ name = 'Kontak', list = [] } = {}) {
    const cards = []
    for (const c of list) {
      const one = await build.contact(c)
      cards.push(one.content.contactMessage)
    }
    return {
      content: { contactsArrayMessage: { displayName: name, contacts: cards } },
      fallbackText: list.map((c) => `${c.name}: +${digits(c.number)}`).join('\n')
    }
  },

  /** { question, options: string[], selectableCount? } — poll bertipe zapo-js */
  async poll({ question, options = [], selectableCount } = {}) {
    return {
      content: clean({ type: 'poll', name: question, options, selectableCount }), // TODO(verify): nama field selectableCount
      fallbackText: [question, ...options.map((o, i) => `${i + 1}. ${o}`)].join('\n')
    }
  },

  /** { groupJid, inviteCode, groupName?, caption?, expiresInSec? } */
  async groupInvite({ groupJid, inviteCode, groupName, caption, expiresInSec = 86400 } = {}) {
    return {
      content: {
        groupInviteMessage: clean({
          groupJid, inviteCode, groupName, caption,
          inviteExpiration: Math.floor(Date.now() / 1000) + expiresInSec
        })
      },
      fallbackText: `https://chat.whatsapp.com/${inviteCode}`
    }
  },

  // ── Tombol, list, CTA ──────────────────────────────────────
  /**
   * { title?, body, footer?, buttons: [{ text, id }] (maks 3), variant? }
   * variant: 'native' (bawaan, quick_reply) | 'classic' (buttonsMessage resmi). Boleh angka: 1=classic, 2=native.
   * `id` kembali sebagai teks pesan saat ditekan → isi dengan perintah (mis. '.ping').
   */
  async buttons({ title = '', body = '', footer = '', buttons = [], variant = 'native' } = {}) {
    const fallbackText = [body, '', ...buttons.map((b) => `• ${b.id}  (${b.text})`)].join('\n').trim()
    if (pick(variant, { classic: 'classic', 1: 'classic', native: 'native', 2: 'native' }, 'native') === 'classic') {
      return { content: await buildButtonsMessage({ title, body, footer, buttons }), fallbackText }
    }
    return nativeResult({ title, body, footer, buttons: buttons.slice(0, 3).map((b) => btn.quickReply(b.text, b.id)) }, fallbackText)
  },

  /**
   * { title?, body, footer?, buttonText?, sections: [{ title, rows: [{ title, id, description? }] }], variant? }
   * variant: 'native' (bawaan, single_select) | 'classic' (listMessage resmi). Angka: 1=classic, 2=native.
   */
  async list({ title = '', body = '', footer = '', buttonText = 'Lihat', sections = [], variant = 'native' } = {}) {
    const fallbackText = [body, '', ...sections.flatMap((s) => [`*${s.title}*`, ...s.rows.map((r) => `• ${r.id}  (${r.title})`)])].join('\n').trim()
    if (pick(variant, { classic: 'classic', 1: 'classic', native: 'native', 2: 'native' }, 'native') === 'classic') {
      return { content: await buildListMessage({ title, body, footer, buttonText, sections }), fallbackText }
    }
    return nativeResult({ title, body, footer, buttons: [btn.list(buttonText, sections)] }, fallbackText)
  },

  /**
   * Tombol aksi. { title?, body, footer?, buttons: [...] } dengan tiap tombol salah satu:
   *   { type:'url',  text, url }    ← url: URL | nama kunci links | fungsi
   *   { type:'copy', text, code }
   *   { type:'call', text, phone }
   *   { type:'reply', text, id }
   */
  async cta({ title = '', body = '', footer = '', buttons = [] } = {}, env = {}) {
    const out = []
    const lines = []
    for (const b of buttons) {
      if (b.type === 'url') {
        const url = await resolveUrl(b.url, env.links)
        out.push(btn.url(b.text, url)); lines.push(`${b.text}: ${url}`)
      } else if (b.type === 'copy') {
        out.push(btn.copy(b.text, b.code)); lines.push(`${b.text}: ${b.code}`)
      } else if (b.type === 'call') {
        out.push(btn.call(b.text, b.phone)); lines.push(`${b.text}: ${b.phone}`)
      } else if (b.type === 'reply') {
        out.push(btn.quickReply(b.text, b.id)); lines.push(`${b.text}: ${b.id}`)
      } else {
        throw new Error(`Jenis tombol tidak dikenal: ${b.type}`)
      }
    }
    return nativeResult({ title, body, footer, buttons: out }, [body, '', ...lines].join('\n').trim())
  },

  /** Native flow bebas: { title?, subtitle?, body, footer?, buttons: [btn.xxx(...)] } */
  async interactive({ title = '', subtitle = '', body = '', footer = '', buttons = [] } = {}) {
    return nativeResult({ title, subtitle, body, footer, buttons }, body)
  },

  // ── Kartu thumbnail (ad / link preview) ────────────────────
  /**
   * Teks dengan kartu pratinjau bergambar.
   * { text, title?, body?, url?, thumbnail?, variant?, largeThumbnail?, attribution?, appendUrl? }
   *   url        : URL | nama kunci links ('website', 'support', …) | fungsi ({links}) => '…'
   *                Kosong = links.website (bawaan https://zapo.to).
   *   thumbnail  : nama file di assets/, path, atau Buffer (bawaan assets/thumb.jpg)
   *   variant    : 3 (bawaan) link-preview klasik | 1 externalAdReply + matchedText | 2 teks bertipe + contextInfo
   *   appendUrl  : tambahkan URL di akhir teks bila belum ada (perlu agar kartu muncul)
   * Alasan varian: docs zapo — extendedTextMessage dengan matchedText terisi diklasifikasi sebagai pesan link;
   * varian externalAdReply polos pernah tidak sampai ke penerima (uji lapangan).
   */
  async ad({ text = '', title = 'Bot', body = '', url, thumbnail = DEFAULTS.thumbnail, variant = DEFAULTS.adVariant, largeThumbnail = true, attribution = false, appendUrl = true } = {}, env = {}) {
    const link = await resolveUrl(url, env.links)
    const thumb = toBuffer(thumbnail)
    const full = appendUrl && !text.includes(link) ? `${text}\n\n${link}`.trim() : text
    const adReply = clean({
      title, body, mediaType: 1, jpegThumbnail: thumb,
      sourceUrl: link, renderLargerThumbnail: largeThumbnail, showAdAttribution: attribution
    })
    const preview = { matchedText: link, canonicalUrl: link, title, description: body, previewType: 0, jpegThumbnail: thumb }
    const v = [1, 2, 3].includes(Number(variant)) ? Number(variant) : 3

    if (v === 1) {
      return { content: { extendedTextMessage: { text: full, ...preview, contextInfo: { externalAdReply: adReply } } }, fallbackText: full }
    }
    if (v === 2) {
      return {
        content: { type: 'text', text: full, linkPreview: { title, description: body } },
        options: { contextInfo: { externalAdReply: { ...adReply, mediaUrl: link } } },
        fallbackText: full
      }
    }
    return { content: { extendedTextMessage: { text: full, ...preview } }, fallbackText: full }
  }
}
