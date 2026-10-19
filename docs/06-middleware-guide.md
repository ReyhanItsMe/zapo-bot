# 06 — Panduan Middleware

Middleware adalah filter berurutan yang berjalan **sebelum** perintah dieksekusi. Berkas di `middlewares/` dijalankan sesuai awalan angka namanya.

## Kontrak

```js
export default {
  name: 'namaku',
  async run(ctx, next) {
    // lakukan pengecekan...
    await next() // lanjut ke middleware berikutnya / plugin
    // TANPA memanggil next() = alur berhenti (pesan tidak diproses lanjut)
  }
}
```

## Rantai bawaan

| # | File | Fungsi |
|---|---|---|
| 01 | `01-ignore-self.js` | Abaikan pesan dari bot sendiri & status broadcast |
| 02 | `02-parse.js` | Kenali prefix → `command/args/text`; catat user ke DB. Bukan perintah → berhenti di sini |
| 03 | `03-ban-check.js` | User ter-banned diabaikan total (owner kebal) |
| 04 | `04-cooldown.js` | Anti-spam per user per command (`plugin.cooldown`) |
| 05 | `05-permission.js` | Cek `access` plugin; memuat metadata grup untuk `ctx.isAdmin/isBotAdmin`; mengisi `ctx.isPremium` |
| 06 | `06-limit.js` | Potong kuota harian command ber-`limit` (reset tengah malam timezone config); premium/owner bebas |

Setelah middleware terakhir memanggil `next()`, dispatcher menjalankan `plugin.run(ctx)` untuk command yang cocok. Command tak dikenal diabaikan diam-diam (bukan error).

## Menambah middleware sendiri

1. Buat file dengan awalan angka posisi yang diinginkan, mis. `middlewares/04b-anti-kasar.js` — urutan mengikuti urutan nama file.
2. Ikuti kontrak di atas. Penolakan sebaiknya membalas singkat (`await ctx.reply(...)`) lalu **tidak** memanggil `next()`.
3. Restart bot (middleware tidak ikut `.reload` — reload hanya untuk plugin).

Hati-hati: middleware berjalan untuk **setiap** perintah. Jaga tetap cepat; pekerjaan berat (query jaringan) hanya bila perlu, seperti cek metadata grup di 05 yang memakai cache 30 detik (`services/group.js`).
