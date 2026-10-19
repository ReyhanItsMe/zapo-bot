// ═════════════════════════════════════════════════════════════
//  CONTOH PERINTAH — KATEGORI: ai
//  Semua contoh enabled:false. Contoh AI memanggil API EKSTERNAL
//  resmi yang KAMU konfigurasi di .env (AI_API_URL + AI_API_KEY).
//  Base ini sengaja TIDAK menyertakan endpoint/key bawaan dan
//  TIDAK melakukan scraping layanan apa pun.
//  Bila .env kosong, perintah membalas pesan jelas — bukan error.
// ═════════════════════════════════════════════════════════════

// ─── TEMPLATE KOSONG PALING MINIMAL ──────────────────────────
/*
export default {
  command: ['perintahai'],
  category: 'ai',
  description: 'Jelaskan fungsi perintah AI ini',
  usage: '.perintahai pertanyaanmu',
  access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 1 },
  cooldown: 10,
  enabled: false,
  async run(ctx) {
    await ctx.reply('Perintah AI jalan!')
  }
}
*/

export default [

  // ─── CONTOH 1: Chat AI generik via API resmi ─────────────
  // Kapan dipakai : tanya-jawab bebas dengan model AI pilihanmu.
  // Fungsi dipakai: ctx.services.api.post (timeout+retry bawaan),
  // ctx.config.api.aiUrl/aiKey (dari .env). access.limit membatasi
  // biaya API per user per hari.
  {
    command: ['ai', 'tanya'],
    category: 'ai',
    description: 'Tanya AI apa saja',
    usage: '.ai Apa ibu kota Jepang?',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 1 },
    cooldown: 10,
    enabled: false,
    async run(ctx) {
      if (!ctx.config.api.aiUrl || !ctx.config.api.aiKey) {
        await ctx.reply('Fitur AI belum dikonfigurasi owner. Isi AI_API_URL dan AI_API_KEY di file .env untuk mengaktifkannya.')
        return
      }
      if (!ctx.text) { await ctx.reply('Tulis pertanyaannya ya. Contoh: .ai Apa itu fotosintesis?'); return }
      await ctx.react('🤔')
      try {
        // Bentuk body disesuaikan dengan penyedia API pilihanmu.
        // Contoh netral di bawah adalah pola chat-completions umum.
        const data = await ctx.services.api.post(ctx.config.api.aiUrl, {
          messages: [{ role: 'user', content: ctx.text }]
        }, { headers: { authorization: `Bearer ${ctx.config.api.aiKey}` }, timeoutMs: 30_000 })
        const answer = data?.choices?.[0]?.message?.content || data?.answer || data?.text
        await ctx.reply(answer ? String(answer).slice(0, 3000) : 'AI tidak memberi jawaban. Coba pertanyaan lain ya.')
      } catch (err) {
        ctx.log.warn('AI gagal:', err.message)
        await ctx.reply('Maaf, layanan AI sedang tidak bisa dihubungi. Coba lagi nanti.')
      }
    }
  },

  // ─── CONTOH 2: AI hanya untuk premium ────────────────────
  // Kapan dipakai : fitur AI mahal yang dijual sebagai premium.
  // access.premium:true → middleware 05-permission menolak
  // non-premium dengan pesan jelas (owner tetap lolos).
  {
    command: ['aipro'],
    category: 'ai',
    description: 'AI premium tanpa batas pertanyaan singkat',
    usage: '.aipro pertanyaanmu',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: true, limit: 0 },
    cooldown: 5,
    enabled: false,
    async run(ctx) {
      await ctx.reply('Ini contoh perintah AI khusus premium. Duplikasi logika contoh 1 (.ai) di sini setelah fitur premium kamu aktif.')
    }
  },

  // ─── CONTOH 3: Ringkas teks panjang ──────────────────────
  // Kapan dipakai : user me-reply pesan panjang lalu memerintahkan
  // bot meringkasnya. Menggabungkan m.quoted + validasi panjang.
  {
    command: ['ringkas'],
    category: 'ai',
    description: 'Ringkas teks/pesan yang kamu reply',
    usage: '.ringkas (reply pesan panjang)',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 1 },
    cooldown: 15,
    enabled: false,
    async run(ctx) {
      const source = ctx.m.quoted?.text || ctx.text
      if (!source || source.length < 80) {
        await ctx.reply('Reply pesan yang cukup panjang (min. ±80 karakter), lalu ketik .ringkas')
        return
      }
      await ctx.reply(`Contoh ringkasan lokal (${source.length} karakter):\n\n"${source.slice(0, 200)}..."\n\nAktifkan API AI (.env) untuk ringkasan sungguhan — gabungkan pola contoh 1 di file ini.`)
    }
  },

  // ─── CONTOH 4: Terjemah via AI (fallback pesan jelas) ────
  {
    command: ['aitranslate'],
    category: 'ai',
    description: 'Terjemahkan teks ke bahasa Inggris via AI',
    usage: '.aitranslate Selamat pagi semua',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 1 },
    cooldown: 10,
    enabled: false,
    async run(ctx) {
      if (!ctx.text) { await ctx.reply('Contoh: .aitranslate Selamat pagi semua'); return }
      await ctx.reply('Contoh ini kerangka saja: arahkan teks ke API AI/translate resmi milikmu (lihat contoh 1 & kategori tools) lalu balas hasilnya.')
    }
  },

  // ─── CONTOH 5: Cek status konfigurasi AI (owner) ─────────
  // Tidak pernah menampilkan KEY — hanya status terisi/kosong.
  {
    command: ['aistatus'],
    category: 'ai',
    description: 'Cek konfigurasi AI (owner)',
    usage: '.aistatus',
    access: { owner: true, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false,
    async run(ctx) {
      const url = ctx.config.api.aiUrl ? 'terisi' : 'KOSONG'
      const key = ctx.config.api.aiKey ? 'terisi (disembunyikan)' : 'KOSONG'
      await ctx.reply(`*Status AI*\nAI_API_URL: ${url}\nAI_API_KEY: ${key}\nIsi keduanya di .env lalu restart bot.`)
    }
  },

  // ─── CONTOH 6: AI dengan riwayat sederhana di DB ─────────
  // Menyimpan jumlah pertanyaan per user di tabel settings?
  // Bukan — contoh benar: pakai tabel users lewat services tidak
  // punya kolom khusus, jadi contoh memakai db settings global
  // hanya sebagai PENGHITUNG total (bukan data pribadi).
  // Pelajaran: simpan data terstruktur di tabel, bukan settings.
  {
    command: ['aitotal'],
    category: 'ai',
    description: 'Total pertanyaan AI yang pernah masuk (owner)',
    usage: '.aitotal',
    access: { owner: true, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false,
    async run(ctx) {
      const total = Number(ctx.db.getSetting('ai_total_questions', '0')) || 0
      await ctx.reply(`Total pertanyaan AI tercatat: ${total}\n(Counter ini contoh pemakaian db settings — tambah increment di contoh 1 bila diaktifkan.)`)
    }
  }
]
