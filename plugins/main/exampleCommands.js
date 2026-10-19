// ═════════════════════════════════════════════════════════════
//  CONTOH PERINTAH — KATEGORI: main
//  Semua contoh di file ini enabled:false (TIDAK aktif).
//  Cara mengaktifkan: salin satu objek contoh ke file baru
//  (mis. plugins/main/halo.js), ubah enabled menjadi true,
//  lalu restart bot atau pakai perintah owner .reload.
//  Penjelasan tiap field plugin ada di docs/05-plugin-guide.md.
// ═════════════════════════════════════════════════════════════

// ─── TEMPLATE KOSONG PALING MINIMAL ──────────────────────────
// Salin blok ini untuk membuat perintah baru dari nol.
// command     : nama panggilan perintah (huruf kecil, tanpa prefix)
// category    : kelompok di menu (default: nama folder)
// description : satu kalimat fungsi perintah (tampil di menu)
// usage       : contoh pemakaian (tampil di menu)
// access      : aturan siapa yang boleh memakai (lihat contoh 6)
// cooldown    : jeda anti-spam per user, dalam detik
// enabled     : true = aktif, false = dilewati loader
// run(ctx)    : isi logika perintahmu (async)
/*
export default {
  command: ['namaperintah'],
  category: 'main',
  description: 'Jelaskan fungsi perintah ini',
  usage: '.namaperintah',
  access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
  cooldown: 5,
  enabled: false,
  async run(ctx) {
    await ctx.reply('Halo!')
  }
}
*/

export default [

  // ─── CONTOH 1: Balas teks sederhana ──────────────────────
  // Kapan dipakai : perintah sapaan / info statis
  // Fungsi dipakai: ctx.reply(teks)
  {
    command: ['halo', 'hai'],
    category: 'main',
    description: 'Sapaan ramah dari bot',
    usage: '.halo',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false, // ← ubah ke true & pindah ke file sendiri untuk mengaktifkan
    async run(ctx) {
      await ctx.reply(`Halo, ${ctx.m.pushName || 'Kak'}! 👋 Senang bertemu kamu. Ketik ${ctx.prefix}menu untuk melihat semua perintah.`)
    }
  },

  // ─── CONTOH 2: Parsing argumen + validasi ────────────────
  // Kapan dipakai : perintah yang butuh input dari user
  // Fungsi dipakai: ctx.args (kata per kata), ctx.text (gabungan), ctx.reply
  {
    command: ['sapa'],
    category: 'main',
    description: 'Sapa nama yang kamu tulis',
    usage: '.sapa Budi',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 3,
    enabled: false,
    async run(ctx) {
      const nama = ctx.text.trim()
      if (!nama) {
        // Validasi gagal → beri tahu cara pakai yang benar, JANGAN diam.
        await ctx.reply(`Pakainya begini: ${ctx.prefix}sapa Budi`)
        return
      }
      await ctx.reply(`Halo, ${nama}! Semoga harimu menyenangkan 🌤️`)
    }
  },

  // ─── CONTOH 3: Balas dengan mention ──────────────────────
  // Kapan dipakai : menandai pengirim agar muncul notifikasi khusus
  // Fungsi dipakai: ctx.send dengan { type:'text' } + opsi mentions.
  // PENTING: teks wajib memuat "@nomor" agar mention ter-render.
  {
    command: ['panggil'],
    category: 'main',
    description: 'Memanggilmu kembali dengan mention',
    usage: '.panggil',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false,
    async run(ctx) {
      const nomor = ctx.m.senderNumber || ctx.m.senderId
      await ctx.send(ctx.m.chat, {
        type: 'text',
        text: `Hei @${nomor}, kamu dipanggil! 🔔`
      }, { mentions: [ctx.m.sender] })
    }
  },

  // ─── CONTOH 4: Reaksi emoji + balasan ────────────────────
  // Kapan dipakai : memberi umpan balik cepat sebelum/sesudah proses
  // Fungsi dipakai: ctx.react(emoji), ctx.reply
  {
    command: ['keren'],
    category: 'main',
    description: 'Bot bereaksi pada pesanmu',
    usage: '.keren',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 3,
    enabled: false,
    async run(ctx) {
      await ctx.react('🔥')
      await ctx.reply('Siap, sama-sama keren! 🔥')
    }
  },

  // ─── CONTOH 5: Membaca pesan yang di-quote (m.quoted) ────
  // Kapan dipakai : perintah yang bekerja pada pesan lain
  // (mis. "terjemahkan pesan ini", "simpan catatan ini")
  // Fungsi dipakai: ctx.m.quoted (null bila tidak me-reply pesan)
  {
    command: ['kutip'],
    category: 'main',
    description: 'Tampilkan kembali teks pesan yang kamu reply',
    usage: '.kutip (sambil reply sebuah pesan)',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 3,
    enabled: false,
    async run(ctx) {
      if (!ctx.m.quoted) {
        await ctx.reply('Reply dulu sebuah pesan, lalu ketik .kutip ya.')
        return
      }
      await ctx.reply(`Kamu me-reply pesan bertipe *${ctx.m.quoted.type}*:\n\n"${ctx.m.quoted.text || '(tanpa teks)'}"`)
    }
  },

  // ─── CONTOH 6: access, limit & error handling ────────────
  // Kapan dipakai : perintah berat yang perlu dibatasi kuotanya.
  // access.limit:2 → tiap pemakaian memotong 2 kuota harian
  // (middleware 06-limit). cooldown membatasi spam per user.
  // try/catch di dalam run memberi pesan ramah saat gagal —
  // dispatcher juga punya jaring pengaman yang sama.
  {
    command: ['beratsim'],
    category: 'main',
    description: 'Simulasi perintah berat ber-limit (contoh)',
    usage: '.beratsim',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 2 },
    cooldown: 10,
    enabled: false,
    async run(ctx) {
      try {
        // Simulasi pekerjaan berat:
        await new Promise((r) => setTimeout(r, 500))
        await ctx.reply('Selesai! Perintah berat ini memotong 2 kuota harianmu (lihat .info).')
      } catch (err) {
        ctx.log.error('beratsim gagal:', err)
        await ctx.reply('Maaf, perintah ini sedang gagal diproses. Coba lagi nanti ya.')
      }
    }
  }
]
