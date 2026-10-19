// ═════════════════════════════════════════════════════════════
//  CONTOH PERINTAH — KATEGORI: tools
//  Semua contoh enabled:false. Perkakas kecil yang umumnya lokal
//  (tanpa API luar) kecuali translate yang butuh endpoint resmi
//  milikmu sendiri (TRANSLATE_API_URL di .env).
// ═════════════════════════════════════════════════════════════

// ─── TEMPLATE KOSONG PALING MINIMAL ──────────────────────────
/*
export default {
  command: ['perintahtools'],
  category: 'tools',
  description: 'Jelaskan fungsi perkakas ini',
  usage: '.perintahtools',
  access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
  cooldown: 5,
  enabled: false,
  async run(ctx) {
    await ctx.reply('Perkakas jalan!')
  }
}
*/

export default [

  // ─── CONTOH 1: Kalkulator aman (tanpa eval) ──────────────
  // Kapan dipakai : hitung ekspresi sederhana dari argumen.
  // PENTING: jangan eval() input user! Parser kecil di bawah
  // hanya menerima angka dan operator + - * / ( ) .
  {
    command: ['hitung', 'calc'],
    category: 'tools',
    description: 'Kalkulator sederhana yang aman',
    usage: '.hitung 12 * 8 + 5',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 3,
    enabled: false,
    async run(ctx) {
      const expr = ctx.text.replace(/\s+/g, '')
      if (!/^[0-9+\-*/().]+$/.test(expr) || !expr) {
        await ctx.reply('Contoh: .hitung 12 * 8 + 5\n(Hanya angka dan + - * / ( ) yang diizinkan.)')
        return
      }
      try {
        // Parser rekursif sederhana — BUKAN eval.
        let i = 0
        const parseExpr = () => {
          let v = parseTerm()
          while (expr[i] === '+' || expr[i] === '-') { const op = expr[i++]; const r = parseTerm(); v = op === '+' ? v + r : v - r }
          return v
        }
        const parseTerm = () => {
          let v = parseFactor()
          while (expr[i] === '*' || expr[i] === '/') { const op = expr[i++]; const r = parseFactor(); v = op === '*' ? v * r : v / r }
          return v
        }
        const parseFactor = () => {
          if (expr[i] === '(') { i += 1; const v = parseExpr(); i += 1; return v } // lewati ')'
          const start = i
          while (i < expr.length && /[0-9.]/.test(expr[i])) i += 1
          return Number(expr.slice(start, i))
        }
        const result = parseExpr()
        await ctx.reply(`🧮 ${ctx.text} = *${result}*`)
      } catch {
        await ctx.reply('Ekspresi tidak valid. Periksa lagi ya.')
      }
    }
  },

  // ─── CONTOH 2: Cek sisa limit sendiri ────────────────────
  // Fungsi dipakai: ctx.services.user.limitInfo
  {
    command: ['ceklimit'],
    category: 'tools',
    description: 'Cek sisa kuota harianmu',
    usage: '.ceklimit',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false,
    async run(ctx) {
      if (ctx.isOwner || ctx.isPremium) { await ctx.reply('Statusmu bebas limit harian ⭐'); return }
      const info = ctx.services.user.limitInfo(ctx.m.sender)
      await ctx.reply(`Kuota hari ini: terpakai ${info.used} dari ${info.total}. Sisa: *${info.remaining}*. Reset tengah malam.`)
    }
  },

  // ─── CONTOH 3: Pengingat via scheduler ───────────────────
  // Scheduler di services adalah contoh implementasi: di sini
  // pengingat dibuat dengan penundaan sederhana di memori.
  // Untuk pengingat persisten, simpan ke DB + scheduler harian.
  {
    command: ['ingatkan'],
    category: 'tools',
    description: 'Minta bot mengingatkanmu (menit)',
    usage: '.ingatkan 5 Minum air',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false,
    async run(ctx) {
      const minutes = Number(ctx.args[0])
      const note = ctx.args.slice(1).join(' ') || 'Pengingat kamu'
      if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 1440) {
        await ctx.reply('Contoh: .ingatkan 5 Minum air\n(Angka pertama = jumlah menit, 1–1440.)')
        return
      }
      await ctx.reply(`Siap! Kamu akan diingatkan dalam ${minutes} menit: "${note}"`)
      setTimeout(() => {
        ctx.send(ctx.m.chat, `⏰ *Pengingat*\n${note}`).catch(() => {})
      }, minutes * 60_000).unref?.()
    }
  },

  // ─── CONTOH 4: Translate via endpoint resmi milikmu ──────
  // Tanpa endpoint yang dikonfigurasi, bot membalas pesan jelas.
  {
    command: ['translate', 'tr'],
    category: 'tools',
    description: 'Terjemahkan teks (butuh TRANSLATE_API_URL)',
    usage: '.translate Selamat pagi',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 1 },
    cooldown: 8,
    enabled: false,
    async run(ctx) {
      if (!ctx.text) { await ctx.reply('Contoh: .translate Selamat pagi'); return }
      if (!ctx.config.api.translateUrl) {
        await ctx.reply('Fitur translate belum dikonfigurasi owner (TRANSLATE_API_URL kosong di .env).')
        return
      }
      try {
        const data = await ctx.services.api.post(ctx.config.api.translateUrl, { text: ctx.text, target: 'en' })
        await ctx.reply(String(data?.translated || data?.text || 'Tidak ada hasil terjemahan.'))
      } catch (err) {
        await ctx.reply(`Translate gagal: ${err.message}`)
      }
    }
  },

  // ─── CONTOH 5: Persingkat tautan (kerangka aman) ─────────
  // Sengaja TIDAK memanggil layanan shortlink tertentu secara
  // default: aktifkan hanya dengan API resmi pilihanmu agar
  // tidak melanggar ketentuan layanan pihak mana pun.
  {
    command: ['shortlink'],
    category: 'tools',
    description: 'Persingkat tautan (kerangka, perlu API milikmu)',
    usage: '.shortlink https://contoh.com/artikel',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 1 },
    cooldown: 8,
    enabled: false,
    async run(ctx) {
      const url = ctx.args[0] || ''
      let valid = false
      try { valid = ['http:', 'https:'].includes(new URL(url).protocol) } catch { valid = false }
      if (!valid) { await ctx.reply('Kirim tautan yang valid. Contoh: .shortlink https://contoh.com/artikel'); return }
      await ctx.reply('Contoh shortlink ini masih kerangka: hubungkan services.api ke API shortlink resmi pilihanmu, lalu balas tautan pendeknya di sini. Tautan kamu sudah lolos validasi ✅')
    }
  },

  // ─── CONTOH 6: Kirim pesan ke chat lain (ctx.send) ───────
  // Kapan dipakai : meneruskan laporan ke grup/admin tertentu.
  // Ilustrasi penggunaan ctx.send(jid, isi) selain ctx.reply.
  {
    command: ['lapor'],
    category: 'tools',
    description: 'Kirim laporan ke owner lewat bot',
    usage: '.lapor Ada spam di grup sebelah',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 30,
    enabled: false,
    async run(ctx) {
      if (!ctx.text) { await ctx.reply('Tulis isi laporannya. Contoh: .lapor Ada spam di grup sebelah'); return }
      const ownerJid = ctx.config.owners[0] ? `${ctx.config.owners[0]}@s.whatsapp.net` : null
      if (!ownerJid) { await ctx.reply('Owner belum mengatur nomor tujuan laporan.'); return }
      await ctx.send(ownerJid, `📩 *Laporan Baru*\nDari: ${ctx.m.pushName || '-'} (${ctx.m.senderNumber || ctx.m.senderId})\nIsi: ${ctx.text}`)
      await ctx.reply('Laporanmu sudah diteruskan ke owner. Terima kasih! 🙏')
    }
  }
]
