# 13 — Jenis Menu (plugins/menu/)

> Sejak v1.2.0 semua jenis menu dipanggil lewat `ctx.rich.*`. Referensi fungsi lengkap: **`docs/14-rich-api.md`**. Dokumen ini berisi catatan hasil uji lapangan tiap jenis.

Folder `plugins/menu/` berisi **7 contoh menu**, satu per jenis. Salin salah satu sebagai templat, ganti nama dan isinya, lalu hapus yang tidak dipakai. Ketik `.menus` untuk melihat daftarnya.

| Perintah | Jenis | Cara kirim | Status API |
| --- | --- | --- | --- |
| `.menuimg` | Gambar + caption (thumbnail) | `{ type:'image', media, mimetype, caption }` | Terdokumentasi di zapo-js |
| `.menudoc` | Dokumen palsu (PDF + caption) | `{ type:'document', media, mimetype, fileName, caption }` | Terdokumentasi |
| `.menugif` | Video/GIF + caption | `{ type:'video', media, mimetype, caption, gifPlayback }` | Terdokumentasi |
| `.menubtn` | 3 tombol (`.menubtn 1` = buttonsMessage resmi, `.menubtn 2` = native flow) | raw proto | bentuk 1 ada di docs zapo; uji di HP |
| `.menulist` | List per kategori (`.menulist 1` = listMessage resmi, `.menulist 2` = native flow) | raw proto | bentuk 1 ada di docs zapo; uji di HP |
| `.menucta` | Tombol link / salin / telepon | raw proto, tombol `cta_url` / `cta_copy` / `cta_call` | `TODO(verify)` |
| `.menuad` | Teks + kartu thumbnail (3 varian: `.menuad 1/2/3`) | raw proto `externalAdReply` atau link-preview klasik | `TODO(verify)` |

## Aset

Ganti file di folder `assets/` dengan milikmu (nama file sama):
- `menu.jpg` banner menu (rasio 16:9), dipakai `.menuimg`
- `thumb.jpg` thumbnail kecil (±300 px), dipakai `.menuad`
- `menu.pdf` lampiran palsu, dipakai `.menudoc`
- `menu.mp4` video pendek (< 1 MB), dipakai `.menugif`

Kalau file tidak ada, plugin membalas teks biasa.

## Tombol dan list: cara kerjanya

- Pembuat tombol ada di `lib/rich.js` (`btn.quickReply`, `btn.url`, `btn.copy`, `btn.call`, `btn.list`).
- Saat user menekan tombol atau memilih baris list, WhatsApp mengirim balik `id`-nya. `lib/serialize.js` membaca `id` itu sebagai **teks pesan**. Jadi kalau `id` berisi perintah lengkap (misalnya `.ping`), perintah itu langsung dijalankan seperti diketik user.
- `sendRich()` mencoba tiga bentuk berurutan: (1) terbungkus `viewOnceMessage`, (2) polos, (3) teks biasa. Jadi menu tetap terkirim walau tombol ditolak.

## Peringatan (jujur)

- Tombol, list, CTA, dan kartu thumbnail memakai raw proto yang **belum terverifikasi** di dokumentasi zapo-js. "Terkirim" hanya berarti server menerima. Kalau HP penerima tidak merender tombol, pesan bisa tampil kosong atau "pesan tidak didukung". Itu tidak bisa dideteksi oleh bot.
- WhatsApp membatasi tombol dan list klasik untuk akun biasa dan sering mengubah aturannya. Uji di nomor dan HP yang akan dipakai pembeli, dan jangan menjanjikan tombol di deskripsi produk sebelum teruji.
- Jenis yang paling aman: `.menuimg`, `.menudoc`, `.menugif`.

## Hasil uji lapangan (v1.1.0)

- `.menucta` (tombol link/salin/telepon): **terbukti tampil dan berfungsi** di HP penerima.
- `.menugif` (video): **terbukti sampai**.
- `.menuad` varian `externalAdReply`: **tidak sampai** ke penerima (pengirim hanya 1 centang, tanpa error). WhatsApp bisa membuang pesan semacam ini secara diam-diam, sehingga fallback teks tidak ikut jalan. Pakai `.menuad 1`, `.menuad 2`, dan `.menuad 3` untuk mencari varian yang diterima; bawaan sekarang varian 3.
- Tanda pesan tidak diterima: di HP bot cuma ada satu centang, dan penerima tidak melihat apa pun.

## Temuan dari docs zapo (guides/raw-sends, reference/message-types)

- Bentuk `buttonsMessage` (maks 3 tombol) dan `listMessage` didokumentasikan resmi. Zapo bahkan memilih bentuk stanza yang benar untuk list di grup. Keduanya tersedia sebagai varian `1` di `.menubtn` dan `.menulist`.
- `extendedTextMessage` dengan `matchedText` yang tidak kosong diperlakukan sebagai pesan link/media. Server WhatsApp membuang diam-diam stanza media yang tidak punya `mediatype`. Ini dugaan kuat kenapa `.menuad` varian `externalAdReply` polos tidak sampai, sedangkan varian link-preview sampai. Sekarang semua varian `.menuad` membawa `matchedText`.
- `client.message.send(to, content, options)` punya `options.contextInfo` untuk context info mentah. `.menuad 2` memakainya (teks bertipe + `linkPreview` + `contextInfo.externalAdReply`).
- Tombol native flow memakai `messageVersion: 1`.
