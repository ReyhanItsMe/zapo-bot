// ═════════════════════════════════════════════════════════════
//  CONTOH PERINTAH — KATEGORI: owner
//  Semua contoh enabled:false dan access.owner:true.
//  Owner = nomor yang terdaftar di .env OWNER_NUMBERS.
//  Perintah owner sangat kuat — aktifkan hanya yang kamu paham.
// ═════════════════════════════════════════════════════════════

// ─── TEMPLATE KOSONG PALING MINIMAL ──────────────────────────
/*
export default {
  command: ['perintahowner'],
  category: 'owner',
  description: 'Jelaskan fungsi perintah owner ini',
  usage: '.perintahowner',
  access: { owner: true, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
  cooldown: 3,
  enabled: false,
  async run(ctx) {
    await ctx.reply('Perintah owner jalan!')
  }
}
*/

export default [

  // ─── CONTOH 1: Broadcast ke semua grup (ctx.send ke chat lain)
  // Kapan dipakai : pengumuman owner ke grup-grup yang diikuti bot.
  // Fungsi dipakai: ctx.services.group (queryAllGroups langsung
  // lewat client.group), ctx.send. Diberi jeda antar kirim agar
  // tidak dianggap spam — antrean kirim juga sudah memberi jeda.
  {
    command: ['broadcast', 'bc'],
    category: 'owner',
    description: 'Kirim pengumuman ke semua grup bot',
    usage: '.broadcast Isi pengumuman',
    access: { owner: true, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 60,
    enabled: false,
    async run(ctx) {
      if (!ctx.text) { await ctx.reply('Contoh: .broadcast Halo semua, bot maintenance malam ini.'); return }
      const groups = await ctx.client.group.queryAllGroups()
      const list = Array.isArray(groups) ? groups : (groups?.groups || [])
      let ok = 0
      for (const g of list) {
        const jid = g?.jid || g?.id
        if (!jid) continue
        try { await ctx.send(jid, `📢 *Pengumuman*\n\n${ctx.text}`); ok += 1 } catch { /* grup gagal dicatat di akhir */ }
      }
      await ctx.reply(`Broadcast selesai: terkirim ke ${ok} grup.`)
    }
  },

  // ─── CONTOH 2: Beri premium ke user (services + db) ──────
  // Kapan dipakai : owner mengaktifkan premium untuk pelanggan.
  // Fungsi dipakai: ctx.services.user.setPremium (membungkus db).
  {
    command: ['setpremium'],
    category: 'owner',
    description: 'Jadikan user sebagai premium',
    usage: '.setpremium 62812xxxx',
    access: { owner: true, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 3,
    enabled: false,
    async run(ctx) {
      if (!ctx.args[0]) { await ctx.reply('Contoh: .setpremium 6281234567890'); return }
      const user = ctx.services.user.setPremium(ctx.args[0], true)
      await ctx.reply(user ? `⭐ ${ctx.args[0]} sekarang premium.` : 'Nomor tidak valid.')
    }
  },

  // ─── CONTOH 3: Cabut premium ─────────────────────────────
  {
    command: ['delpremium'],
    category: 'owner',
    description: 'Cabut status premium user',
    usage: '.delpremium 62812xxxx',
    access: { owner: true, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 3,
    enabled: false,
    async run(ctx) {
      if (!ctx.args[0]) { await ctx.reply('Contoh: .delpremium 6281234567890'); return }
      const user = ctx.services.user.setPremium(ctx.args[0], false)
      await ctx.reply(user ? `Status premium ${ctx.args[0]} dicabut.` : 'Nomor tidak valid.')
    }
  },

  // ─── CONTOH 4: Restart bot ───────────────────────────────
  // Kapan dipakai : menerapkan perubahan config tanpa buka panel.
  // Di Pterodactyl/VPS dengan auto-restart (PM2/systemd/panel),
  // keluar dengan kode 0 membuat supervisor menghidupkan ulang.
  // Shutdown rapi ditangani handler SIGTERM di main.js.
  {
    command: ['restart'],
    category: 'owner',
    description: 'Restart proses bot',
    usage: '.restart',
    access: { owner: true, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 10,
    enabled: false,
    async run(ctx) {
      await ctx.reply('♻️ Bot dimatikan untuk restart. Pastikan supervisor (panel/PM2) menghidupkannya kembali.')
      setTimeout(() => process.kill(process.pid, 'SIGTERM'), 500)
    }
  },

  // ─── CONTOH 5: Statistik bot dari DB ─────────────────────
  // Fungsi dipakai: ctx.db.raw (koneksi better-sqlite3) untuk
  // query agregat. Plugin tipis, logika data tetap sederhana.
  {
    command: ['stats'],
    category: 'owner',
    description: 'Statistik pengguna & grup bot',
    usage: '.stats',
    access: { owner: true, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 10,
    enabled: false,
    async run(ctx) {
      const users = ctx.db.raw.prepare('SELECT COUNT(*) c FROM users').get().c
      const banned = ctx.db.raw.prepare('SELECT COUNT(*) c FROM users WHERE banned = 1').get().c
      const premium = ctx.db.raw.prepare('SELECT COUNT(*) c FROM users WHERE premium = 1').get().c
      const groups = ctx.db.raw.prepare('SELECT COUNT(*) c FROM groups').get().c
      await ctx.reply(`*Statistik Bot*\nPengguna terdaftar: ${users}\nPremium: ${premium}\nTer-banned: ${banned}\nGrup dikenal: ${groups}`)
    }
  },

  // ─── CONTOH 6: Eval JavaScript (BERBAHAYA, mati by default) ──
  // Kapan dipakai : debugging langsung oleh owner SAJA.
  // Risiko: siapa pun yang menguasai nomor owner bisa menjalankan
  // kode apa pun di server. Karena itu contoh ini dicek ganda:
  // enabled:false DAN config.allowEval (ALLOW_EVAL di .env, default
  // false). Jangan aktifkan di bot publik.
  {
    command: ['eval'],
    category: 'owner',
    description: 'Jalankan kode JavaScript (owner, berbahaya)',
    usage: '.eval ctx.m.sender',
    access: { owner: true, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
    cooldown: 0,
    enabled: false,
    async run(ctx) {
      if (!ctx.config.allowEval) {
        await ctx.reply('Eval dinonaktifkan. Set ALLOW_EVAL=true di .env hanya bila paham risikonya.')
        return
      }
      try {
        // eslint-disable-next-line no-eval
        const result = await eval(ctx.text)
        await ctx.reply(`Hasil:\n${typeof result === 'string' ? result : JSON.stringify(result, null, 2) ?? String(result)}`)
      } catch (err) {
        await ctx.reply(`Error eval: ${err.message}`)
      }
    }
  }
]
