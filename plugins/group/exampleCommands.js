// ═════════════════════════════════════════════════════════════
//  CONTOH PERINTAH — KATEGORI: group
//  Semua contoh enabled:false. Cara mengaktifkan: salin objek ke
//  file baru di folder ini, ubah enabled:true, restart/.reload.
//  Perintah grup umumnya digabung access.group:true dan
//  access.admin / access.botAdmin sesuai kebutuhan.
// ═════════════════════════════════════════════════════════════

// ─── TEMPLATE KOSONG PALING MINIMAL ──────────────────────────
/*
export default {
  command: ['perintahgrup'],
  category: 'group',
  description: 'Jelaskan fungsi perintah grup ini',
  usage: '.perintahgrup',
  access: { owner: false, admin: true, botAdmin: true, group: true, private: false, premium: false, limit: 0 },
  cooldown: 5,
  enabled: false,
  async run(ctx) {
    await ctx.reply('Perintah grup jalan!')
  }
}
*/

export default [

  // ─── CONTOH 1: Info grup (metadata) ──────────────────────
  // Kapan dipakai : menampilkan nama grup & jumlah anggota
  // Fungsi dipakai: ctx.services.group.getMetadata(client, chat)
  {
    command: ['infogrup'],
    category: 'group',
    description: 'Lihat info grup ini',
    usage: '.infogrup',
    access: { owner: false, admin: false, botAdmin: false, group: true, private: false, premium: false, limit: 0 },
    cooldown: 10,
    enabled: false,
    async run(ctx) {
      const meta = await ctx.services.group.getMetadata(ctx.client, ctx.m.chat)
      const total = ctx.services.group.participants(meta).length
      await ctx.reply(`*${meta.subject || 'Grup'}*\nAnggota: ${total} orang\nID grup: ${ctx.m.chat}`)
    }
  },

  // ─── CONTOH 2: Kick anggota (admin + botAdmin) ───────────
  // Kapan dipakai : admin mengeluarkan anggota bermasalah.
  // access.admin   → pengirim wajib admin grup (atau owner bot)
  // access.botAdmin→ bot wajib jadi admin, kalau tidak WA menolak
  // Fungsi dipakai: ctx.m.mentions / ctx.args, services.group.remove
  {
    command: ['kick'],
    category: 'group',
    description: 'Keluarkan anggota dari grup',
    usage: '.kick 62812xxxx (atau mention orangnya)',
    access: { owner: false, admin: true, botAdmin: true, group: true, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false,
    async run(ctx) {
      const target = ctx.m.mentions[0] || ctx.args[0]
      if (!target) { await ctx.reply('Sebutkan nomor atau mention anggota yang mau dikeluarkan. Contoh: .kick 6281234567890'); return }
      const results = await ctx.services.group.remove(ctx.client, ctx.m.chat, [target])
      await ctx.reply(ctx.services.group.summarizeResults(results) || 'Permintaan kick sudah dikirim.')
    }
  },

  // ─── CONTOH 3: Add anggota ───────────────────────────────
  // Kapan dipakai : admin menambahkan anggota lewat nomor.
  // Catatan: WhatsApp bisa menolak (403) bila privasi user
  // melarang di-add — pesan ringkasan menjelaskan penyebabnya.
  {
    command: ['add'],
    category: 'group',
    description: 'Tambahkan anggota ke grup',
    usage: '.add 62812xxxx',
    access: { owner: false, admin: true, botAdmin: true, group: true, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false,
    async run(ctx) {
      if (!ctx.args[0]) { await ctx.reply('Contoh: .add 6281234567890'); return }
      const results = await ctx.services.group.add(ctx.client, ctx.m.chat, ctx.args)
      await ctx.reply(ctx.services.group.summarizeResults(results) || 'Permintaan add sudah dikirim.')
    }
  },

  // ─── CONTOH 4: Promote / demote admin ────────────────────
  // Satu file boleh mengekspor ARRAY berisi banyak perintah —
  // contoh ini memuat dua perintah sekaligus (promote & demote).
  {
    command: ['promote'],
    category: 'group',
    description: 'Jadikan anggota sebagai admin grup',
    usage: '.promote 62812xxxx',
    access: { owner: false, admin: true, botAdmin: true, group: true, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false,
    async run(ctx) {
      if (!ctx.args[0] && !ctx.m.mentions[0]) { await ctx.reply('Contoh: .promote 6281234567890'); return }
      const results = await ctx.services.group.promote(ctx.client, ctx.m.chat, [ctx.m.mentions[0] || ctx.args[0]])
      await ctx.reply(ctx.services.group.summarizeResults(results) || 'Sudah diproses.')
    }
  },
  {
    command: ['demote'],
    category: 'group',
    description: 'Turunkan admin menjadi anggota biasa',
    usage: '.demote 62812xxxx',
    access: { owner: false, admin: true, botAdmin: true, group: true, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false,
    async run(ctx) {
      if (!ctx.args[0] && !ctx.m.mentions[0]) { await ctx.reply('Contoh: .demote 6281234567890'); return }
      const results = await ctx.services.group.demote(ctx.client, ctx.m.chat, [ctx.m.mentions[0] || ctx.args[0]])
      await ctx.reply(ctx.services.group.summarizeResults(results) || 'Sudah diproses.')
    }
  },

  // ─── CONTOH 5: Anti-link per grup (toggle di database) ───
  // Kapan dipakai : admin grup menyalakan/mematikan filter tautan
  // untuk grup INI saja. Setting disimpan di tabel groups
  // (ctx.db.setGroupSetting) dan dibaca fitur antilink.
  // Fungsi dipakai: ctx.db.getGroupSetting / setGroupSetting
  {
    command: ['antilink'],
    category: 'group',
    description: 'Nyalakan/matikan anti-link khusus grup ini',
    usage: '.antilink on / .antilink off',
    access: { owner: false, admin: true, botAdmin: false, group: true, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false,
    async run(ctx) {
      const mode = (ctx.args[0] || '').toLowerCase()
      if (!['on', 'off'].includes(mode)) {
        const current = ctx.db.getGroupSetting(ctx.m.chat, 'antilink', ctx.config.features.antilink)
        await ctx.reply(`Anti-link grup ini saat ini: *${current ? 'ON' : 'OFF'}*\nUbah dengan: .antilink on / .antilink off`)
        return
      }
      ctx.db.setGroupSetting(ctx.m.chat, 'antilink', mode === 'on')
      await ctx.reply(`Anti-link grup ini sekarang: *${mode.toUpperCase()}*`)
    }
  },

  // ─── CONTOH 6: Welcome per grup (toggle database) ────────
  // Pasangan contoh 5 untuk fitur sambutan anggota baru
  // (dieksekusi events/group-update.js saat ada anggota join).
  {
    command: ['welcome'],
    category: 'group',
    description: 'Nyalakan/matikan sambutan anggota baru di grup ini',
    usage: '.welcome on / .welcome off',
    access: { owner: false, admin: true, botAdmin: false, group: true, private: false, premium: false, limit: 0 },
    cooldown: 5,
    enabled: false,
    async run(ctx) {
      const mode = (ctx.args[0] || '').toLowerCase()
      if (!['on', 'off'].includes(mode)) {
        const current = ctx.db.getGroupSetting(ctx.m.chat, 'welcome', ctx.config.features.welcome)
        await ctx.reply(`Welcome grup ini saat ini: *${current ? 'ON' : 'OFF'}*\nUbah dengan: .welcome on / .welcome off`)
        return
      }
      ctx.db.setGroupSetting(ctx.m.chat, 'welcome', mode === 'on')
      await ctx.reply(`Sambutan anggota baru sekarang: *${mode.toUpperCase()}*`)
    }
  }
]
