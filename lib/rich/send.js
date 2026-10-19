// lib/rich/send.js — pengiriman hasil builder dengan jaring pengaman.
// Catatan: "berhasil" berarti server menerima. Pesan yang dibuang diam-diam oleh
// WhatsApp (1 centang di HP bot) tidak bisa dideteksi dari sini.

/**
 * Coba content utama → alternatives → teks cadangan.
 * @returns {{ ok: boolean, via: 'main'|'alternative'|'text' }}
 */
export async function sendBuilt(ctx, built, fallbackText, { to, quote } = {}) {
  const jid = to || ctx.m.chat
  const attempts = [{ ...built, label: 'main' }, ...(built.alternatives || []).map((a) => ({ ...a, label: 'alternative' }))]
  let lastError
  for (const a of attempts) {
    const options = { ...(a.options || {}), ...(quote ? { quote: ctx.event } : {}) }
    try {
      await ctx.send(jid, a.content, Object.keys(options).length ? options : undefined)
      return { ok: true, via: a.label }
    } catch (err) {
      lastError = err
      ctx.log?.warn?.(`rich: pengiriman (${a.label}) gagal: ${err?.message || err}`)
    }
  }
  const text = fallbackText ?? built.fallbackText
  if (text) {
    await ctx.send(jid, text, quote ? { quote: ctx.event } : undefined)
    return { ok: false, via: 'text' }
  }
  throw lastError
}

// ── Kompatibilitas dengan lib/rich.js lama (v1.1.x) ─────────
import { buildInteractive } from './native.js'

export async function sendRich(ctx, options, fallbackText) {
  for (const [label, wrap] of [['wrapped', true], ['plain', false]]) {
    try {
      await ctx.send(ctx.m.chat, buildInteractive({ ...options, wrap }))
      return label
    } catch (err) {
      ctx.log?.warn?.(`sendRich (${label}) gagal: ${err?.message || err}`)
    }
  }
  await ctx.reply(fallbackText)
  return 'text'
}

export async function sendShape(ctx, content, fallbackText, options) {
  try {
    await ctx.send(ctx.m.chat, content, options)
    return 'sent'
  } catch (err) {
    ctx.log?.warn?.(`sendShape gagal: ${err?.message || err}`)
    await ctx.reply(fallbackText)
    return 'text'
  }
}

export async function sendOrText(ctx, content, fallbackText) {
  try {
    return await ctx.reply(content)
  } catch (err) {
    ctx.log?.warn?.(`Kirim gagal, pakai teks: ${err?.message || err}`)
    return ctx.reply(fallbackText)
  }
}
