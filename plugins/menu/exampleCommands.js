// ═══════════════════════════════════════════════════════════
// plugins/menu/exampleCommands.js — BUKU PANDUAN ctx.rich
// ═══════════════════════════════════════════════════════════
// Semua contoh di sini `enabled: false` supaya tidak aktif tanpa sengaja.
// Untuk mencoba: ubah `enabled: false` → `true` pada contoh yang diinginkan,
// lalu restart bot (atau .reload sebagai owner). Salin contoh ini sebagai
// templat plugin barumu. Referensi lengkap: docs/14-rich-api.md
//
// TEMPLAT KOSONG PALING MINIMAL (salin ke file baru):
//   export default {
//     command: 'namaperintah',
//     category: 'menu',
//     description: 'Deskripsi singkat',
//     access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
//     cooldown: 3,
//     enabled: true,
//     async run(ctx) { await ctx.reply('Halo!') }
//   }
//
// Opsi umum semua fungsi kirim ctx.rich.*:
//   to       : JID tujuan (bawaan: chat saat ini)
//   quote    : true → membalas pesan pengirim
//   fallback : teks cadangan bila bentuk pesan gagal / file media tidak ada
// ═══════════════════════════════════════════════════════════

export default [
  {
    command: 'exad',
    category: 'menu',
    description: 'Contoh: kartu thumbnail dengan URL dari fungsi',
    usage: '.exad',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false, // ← ubah ke true untuk mengaktifkan contoh ini
    async run(ctx) {
      // ─── CONTOH 1: kartu thumbnail (ad) ─────────────────────────
      // Kapan dipakai : menu/pengumuman bergambar tanpa file gambar besar
      // Fungsi dipakai: ctx.rich.ad
      // url bisa berupa: URL penuh | nama kunci links | FUNGSI.
      await ctx.rich.ad({
        text: 'Halo! Ini pengumuman toko.',
        title: 'Promo Akhir Bulan',
        body: 'Diskon sampai 50%',
        // Fungsi: dipanggil dengan { links }, hasilnya jadi URL. Cocok untuk URL dinamis.
        url: ({ links }) => `${links.website}/promo?ref=${ctx.m.senderNumber}`,
        thumbnail: 'thumb.jpg', // nama file di assets/, path, atau Buffer
        variant: 3 // 1 | 2 | 3 (lihat docs/14-rich-api.md)
      })
    }
  },

  {
    command: 'exurl',
    category: 'menu',
    description: 'Contoh: tiga cara mengisi url',
    usage: '.exurl',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false, // ← ubah ke true untuk mengaktifkan contoh ini
    async run(ctx) {
      // ─── CONTOH 2: cara mengisi `url` ────────────────────────────
      // Fungsi dipakai: ctx.rich.url (resolusi saja, tanpa kirim)
      const a = await ctx.rich.url('support')               // nama kunci → config.links.support
      const b = await ctx.rich.url('toko-kamu.com/promo')   // tanpa https:// → ditambah otomatis
      const c = await ctx.rich.url(() => 'https://contoh.com') // fungsi
      const d = await ctx.rich.url()                         // kosong → links.website (bawaan https://zapo.to)
      await ctx.reply([a, b, c, d].join('\n'))
    }
  },

  {
    command: 'exbtn',
    category: 'menu',
    description: 'Contoh: tombol balasan cepat',
    usage: '.exbtn',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false, // ← ubah ke true untuk mengaktifkan contoh ini
    async run(ctx) {
      // ─── CONTOH 3: tombol (maks 3) ───────────────────────────────
      // Fungsi dipakai: ctx.rich.buttons
      // `id` kembali sebagai teks pesan saat ditekan, jadi isi dengan perintah.
      await ctx.rich.buttons({
        body: 'Mau lihat apa?',
        footer: 'Pilih salah satu',
        buttons: [
          { text: 'Ping', id: '.ping' },
          { text: 'Menu', id: '.menu' }
        ],
        variant: 'native' // 'native' | 'classic'
      })
    }
  },

  {
    command: 'exlist',
    category: 'menu',
    description: 'Contoh: list pilihan buatan sendiri',
    usage: '.exlist',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false, // ← ubah ke true untuk mengaktifkan contoh ini
    async run(ctx) {
      // ─── CONTOH 4: list dengan section sendiri ───────────────────
      // Fungsi dipakai: ctx.rich.list
      await ctx.rich.list({
        body: 'Pilih paket langganan',
        buttonText: 'Lihat paket',
        sections: [
          {
            title: 'Paket',
            rows: [
              { title: 'Basic', id: '.info', description: 'Fitur dasar' },
              { title: 'Pro', id: '.menu', description: 'Semua fitur' }
            ]
          }
        ]
      })
    }
  },

  {
    command: 'excta',
    category: 'menu',
    description: 'Contoh: tombol link/salin/telepon',
    usage: '.excta',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false, // ← ubah ke true untuk mengaktifkan contoh ini
    async run(ctx) {
      // ─── CONTOH 5: tombol aksi (CTA) ─────────────────────────────
      // Fungsi dipakai: ctx.rich.cta
      await ctx.rich.cta({
        body: 'Hubungi kami',
        buttons: [
          { type: 'url', text: 'Website', url: 'website' },
          { type: 'url', text: 'Bantuan', url: 'support' }, // butuh LINK_SUPPORT di .env, kalau kosong → website
          { type: 'copy', text: 'Salin Kode', code: 'HEMAT10' },
          { type: 'call', text: 'Telepon', phone: '+6281234567890' }
        ]
      })
    }
  },

  {
    command: 'eximg',
    category: 'menu',
    description: 'Contoh: kirim gambar',
    usage: '.eximg',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false, // ← ubah ke true untuk mengaktifkan contoh ini
    async run(ctx) {
      // ─── CONTOH 6: gambar / video / GIF / stiker ─────────────────
      // Fungsi dipakai: ctx.rich.image, .video, .gif, .sticker
      await ctx.rich.image({
        media: 'menu.jpg', // nama file di assets/, path, atau Buffer
        caption: 'Gambar dari assets/',
        quote: true, // true = membalas (quote) pesan pengirim
        fallback: 'Gambar tidak tersedia' // dikirim bila file hilang / gagal
      })
      // await ctx.rich.video({ media: 'menu.mp4', caption: 'Video' })
      // await ctx.rich.gif({ media: 'menu.mp4', caption: 'Diputar otomatis' })
      // await ctx.rich.sticker({ media: 'stiker.webp' })
    }
  },

  {
    command: 'exaudio',
    category: 'menu',
    description: 'Contoh: kirim audio / voice note',
    usage: '.exaudio',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false, // ← ubah ke true untuk mengaktifkan contoh ini
    async run(ctx) {
      // ─── CONTOH 7: audio & voice note ────────────────────────────
      // Fungsi dipakai: ctx.rich.audio, ctx.rich.voice
      // Letakkan file di assets/ lalu ganti nama di bawah.
      await ctx.rich.audio({ media: 'lagu.mp3', fallback: 'File audio belum ada di assets/' })
      // await ctx.rich.voice({ media: 'suara.ogg' }) // tampil sebagai voice note
    }
  },

  {
    command: 'exloc',
    category: 'menu',
    description: 'Contoh: kirim lokasi',
    usage: '.exloc',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false, // ← ubah ke true untuk mengaktifkan contoh ini
    async run(ctx) {
      // ─── CONTOH 8: lokasi ────────────────────────────────────────
      // Fungsi dipakai: ctx.rich.location
      await ctx.rich.location({
        latitude: -6.2088,
        longitude: 106.8456,
        name: 'Monas',
        address: 'Jakarta Pusat'
      })
    }
  },

  {
    command: 'excontact',
    category: 'menu',
    description: 'Contoh: kirim kartu kontak',
    usage: '.excontact',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false, // ← ubah ke true untuk mengaktifkan contoh ini
    async run(ctx) {
      // ─── CONTOH 9: kontak (vCard) ────────────────────────────────
      // Fungsi dipakai: ctx.rich.contact, ctx.rich.contacts
      await ctx.rich.contact({ name: 'Admin Toko', number: '6281234567890', organization: 'Toko Kamu' })
      // Banyak kontak sekaligus:
      // await ctx.rich.contacts({ name: 'Tim', list: [{ name: 'A', number: '6281...' }, { name: 'B', number: '6282...' }] })
    }
  },

  {
    command: 'expoll',
    category: 'menu',
    description: 'Contoh: kirim polling',
    usage: '.expoll',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false, // ← ubah ke true untuk mengaktifkan contoh ini
    async run(ctx) {
      // ─── CONTOH 10: polling ──────────────────────────────────────
      // Fungsi dipakai: ctx.rich.poll
      await ctx.rich.poll({
        question: 'Fitur apa yang kamu mau?',
        options: ['Menu tombol', 'Game', 'Downloader']
      })
    }
  },

  {
    command: 'exinvite',
    category: 'menu',
    description: 'Contoh: undangan grup',
    usage: '.exinvite',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false, // ← ubah ke true untuk mengaktifkan contoh ini
    async run(ctx) {
      // ─── CONTOH 11: undangan grup ────────────────────────────────
      // Fungsi dipakai: ctx.rich.groupInvite
      // groupJid: JID grup (xxx@g.us); inviteCode: kode setelah chat.whatsapp.com/
      await ctx.rich.groupInvite({
        groupJid: '123456789-987654@g.us',
        inviteCode: 'KODEUNDANGAN',
        groupName: 'Grup Komunitas',
        caption: 'Gabung yuk!'
      })
    }
  },

  {
    command: 'exmention',
    category: 'menu',
    description: 'Contoh: teks dengan mention',
    usage: '.exmention',
    access: { owner: false, admin: false, botAdmin: false, group: true, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false, // ← ubah ke true untuk mengaktifkan contoh ini
    async run(ctx) {
      // ─── CONTOH 12: teks + mention ───────────────────────────────
      // Fungsi dipakai: ctx.rich.text
      await ctx.rich.text({
        text: `Halo @${ctx.m.senderNumber}!`,
        mentions: [ctx.m.sender],
        quote: true
      })
    }
  },

  {
    command: 'exnative',
    category: 'menu',
    description: 'Contoh: native flow bebas',
    usage: '.exnative',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false, // ← ubah ke true untuk mengaktifkan contoh ini
    async run(ctx) {
      // ─── CONTOH 13: native flow bebas (lanjutan) ─────────────────
      // Fungsi dipakai: ctx.rich.interactive + helper btn.*
      // Dipakai bila ingin mencampur jenis tombol sendiri.
      const { btn } = await import('../../lib/rich/index.js')
      await ctx.rich.interactive({
        body: 'Campuran tombol',
        buttons: [btn.quickReply('Ping', '.ping'), btn.url('Website', await ctx.rich.url('website'))]
      })
    }
  },

  {
    command: 'exbuild',
    category: 'menu',
    description: 'Contoh: bangun pesan tanpa kirim',
    usage: '.exbuild',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false, // ← ubah ke true untuk mengaktifkan contoh ini
    async run(ctx) {
      // ─── CONTOH 14: builder murni ────────────────────────────────
      // Fungsi dipakai: ctx.rich.build.xxx — hanya MEMBANGUN pesan, kamu kirim sendiri.
      // Berguna untuk broadcast atau mengirim ke chat lain.
      const built = await ctx.rich.build.buttons({
        body: 'Pesan siap kirim',
        buttons: [{ text: 'Ping', id: '.ping' }]
      })
      // built = { content, options, alternatives, fallbackText }
      await ctx.send(ctx.m.chat, built.content, built.options)
    }
  }
]
