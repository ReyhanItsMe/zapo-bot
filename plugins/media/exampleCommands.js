// ═════════════════════════════════════════════════════════════
//  CONTOH PERINTAH — KATEGORI: media
//  Semua contoh enabled:false. Fitur media bergantung paket
//  opsional (sharp) & binary ffmpeg — services/media.js memberi
//  pesan jelas bila keduanya tidak tersedia, bot TIDAK crash.
//  Cara download media dari pesan yang di-quote masih perlu
//  verifikasi API zapo-js (KNOWN-ISSUES #5) — contoh di bawah
//  menangani kegagalannya dengan pesan ramah, bukan crash.
// ═════════════════════════════════════════════════════════════

// ─── TEMPLATE KOSONG PALING MINIMAL ──────────────────────────
/*
export default {
  command: ['perintahmedia'],
  category: 'media',
  description: 'Jelaskan fungsi perintah media ini',
  usage: '.perintahmedia',
  access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 1 },
  cooldown: 10,
  enabled: false,
  async run(ctx) {
    await ctx.reply('Perintah media jalan!')
  }
}
*/

export default [

  // ─── CONTOH 1: Gambar → stiker ───────────────────────────
  // Kapan dipakai : user me-reply gambar lalu ketik .sticker
  // Fungsi dipakai: ctx.m.quoted, services.media.download +
  // imageToSticker, ctx.send { type:'sticker' }.
  // access.limit:1 → fitur berat ini memotong kuota harian.
  {
    command: ['sticker', 's'],
    category: 'media',
    description: 'Ubah gambar (reply) menjadi stiker',
    usage: '.sticker (reply sebuah gambar)',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 1 },
    cooldown: 10,
    enabled: false,
    async run(ctx) {
      try {
        const caps = await ctx.services.media.capabilities()
        if (!caps.sharp) {
          await ctx.reply('Fitur stiker butuh paket "sharp" di server. Owner: jalankan npm install sharp lalu restart.')
          return
        }
        const source = ctx.m.quoted?.message || ctx.m.message
        const buffer = await ctx.services.media.download(ctx.client, source)
        const webp = await ctx.services.media.imageToSticker(buffer)
        await ctx.send(ctx.m.chat, { type: 'sticker', media: webp, mimetype: 'image/webp' })
      } catch (err) {
        ctx.log.warn('sticker gagal:', err.message)
        await ctx.reply(`Stiker gagal dibuat: ${err.message}`)
      }
    }
  },

  // ─── CONTOH 2: Stiker → gambar ───────────────────────────
  // Kapan dipakai : user ingin menyimpan stiker sebagai foto.
  {
    command: ['toimg'],
    category: 'media',
    description: 'Ubah stiker (reply) menjadi gambar PNG',
    usage: '.toimg (reply sebuah stiker)',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 1 },
    cooldown: 10,
    enabled: false,
    async run(ctx) {
      try {
        const source = ctx.m.quoted?.message || ctx.m.message
        const buffer = await ctx.services.media.download(ctx.client, source)
        const png = await ctx.services.media.stickerToImage(buffer)
        await ctx.send(ctx.m.chat, { type: 'image', media: png, mimetype: 'image/png', caption: 'Ini versi gambarnya 🖼️' })
      } catch (err) {
        await ctx.reply(`Gagal mengubah stiker: ${err.message}`)
      }
    }
  },

  // ─── CONTOH 3: Kirim gambar dari file aset lokal ─────────
  // Kapan dipakai : perintah info/banner memakai gambar di assets/.
  // media berupa PATH STRING adalah cara yang disarankan zapo-js
  // (di-stream, hemat memori) — bukan dibaca jadi Buffer dulu.
  {
    command: ['banner'],
    category: 'media',
    description: 'Kirim gambar banner bot',
    usage: '.banner',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 10,
    enabled: false,
    async run(ctx) {
      await ctx.send(ctx.m.chat, {
        type: 'image',
        media: 'assets/banner.jpg', // ← siapkan file ini sendiri
        mimetype: 'image/jpeg',
        caption: `*${ctx.config.name}*\nTerima kasih sudah memakai bot ini!`
      })
    }
  },

  // ─── CONTOH 4: Kirim dokumen ─────────────────────────────
  // Kapan dipakai : membagikan PDF/katalog/harga ke pelanggan.
  {
    command: ['katalog'],
    category: 'media',
    description: 'Kirim dokumen katalog (PDF)',
    usage: '.katalog',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 10,
    enabled: false,
    async run(ctx) {
      await ctx.send(ctx.m.chat, {
        type: 'document',
        media: 'assets/katalog.pdf', // ← siapkan file ini sendiri
        mimetype: 'application/pdf',
        fileName: 'Katalog.pdf',
        caption: 'Katalog terbaru kami 📄'
      })
    }
  },

  // ─── CONTOH 5: Info media (butuh ffprobe) ────────────────
  // Kapan dipakai : cek durasi/ukuran/resolusi media yang di-reply.
  {
    command: ['mediainfo'],
    category: 'media',
    description: 'Info teknis media yang kamu reply',
    usage: '.mediainfo (reply video/audio/gambar)',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 1 },
    cooldown: 10,
    enabled: false,
    async run(ctx) {
      try {
        const source = ctx.m.quoted?.message || ctx.m.message
        const buffer = await ctx.services.media.download(ctx.client, source)
        const info = await ctx.services.media.probe(buffer, 'mp4')
        const durasi = info?.format?.duration ? `${Number(info.format.duration).toFixed(1)} detik` : '-'
        await ctx.reply(`*Info Media*\nFormat: ${info?.format?.format_name || '-'}\nDurasi: ${durasi}\nUkuran: ${info?.format?.size || buffer.length} byte`)
      } catch (err) {
        await ctx.reply(`Info media gagal: ${err.message}`)
      }
    }
  },

  // ─── CONTOH 6: Voice note (audio PTT) ────────────────────
  // Kapan dipakai : bot membalas dengan pesan suara.
  // ptt:true membuat audio tampil sebagai voice note (gelombang
  // suara). Format terbaik: OGG/Opus. Berkas contoh tidak disertakan.
  {
    command: ['suara'],
    category: 'media',
    description: 'Kirim contoh voice note',
    usage: '.suara',
    access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 1 },
    cooldown: 15,
    enabled: false,
    async run(ctx) {
      await ctx.send(ctx.m.chat, {
        type: 'audio',
        media: 'assets/contoh-suara.ogg', // ← siapkan file ini sendiri
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true
      })
    }
  }
]
