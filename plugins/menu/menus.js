// ─── INDEKS JENIS MENU ──────────────────────────────────────
// Daftar semua contoh menu. Jadikan plugin-plugin di folder ini sebagai
// templat: salin, ganti nama & isi, lalu hapus yang tidak dipakai.
export default {
  command: ['menus', 'jenismenu'],
  category: 'menu',
  description: 'Daftar semua jenis menu contoh',
  usage: '.menus',
  access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
  cooldown: 5,
  enabled: true,

  async run(ctx) {
    const p = ctx.config.prefix
    await ctx.reply([
      '*JENIS MENU CONTOH*',
      '',
      `1. ${p}menuimg — gambar + caption (thumbnail)`,
      `2. ${p}menudoc — dokumen palsu (PDF)`,
      `3. ${p}menubtn — 3 tombol balasan cepat`,
      `4. ${p}menulist — list pilihan per kategori`,
      `5. ${p}menucta — tombol link / salin / telepon`,
      `6. ${p}menuad — teks + kartu thumbnail besar`,
      `7. ${p}menugif — video/GIF + caption`,
      '',
      'Kode: plugins/menu/ — penjelasan: docs/13-menu-types.md'
    ].join('\n'))
  }
}
