# Changelog

## 1.0.0 — Rilis awal

- Base bot zapo-js (zapo-js 1.10.0, @zapo-js/store-sqlite 1.3.0, better-sqlite3 12.11.1 — binary siap pakai untuk Node 22, 24, dan 26)
- Arsitektur: config terpusat + validasi .env, core (client/connection/loader/dispatcher/context),
  6 middleware berurutan, 4 event handler, 5 services, 5 lib helper
- Plugin aktif: ping, menu (otomatis dari registry), info, reload, ban/unban, tagall
- 36 contoh perintah nonaktif (6 per kategori: main, group, owner, media, ai, tools)
- Dua SQLite terpisah: sesi zapo-js (`data/auth/state.sqlite`) & DB aplikasi (`data/app.sqlite`)
- Sistem ban, premium, cooldown, dan limit harian reset tengah malam (timezone config)
- Dokumentasi pembeli lengkap (01–12) + ZAPO-NOTES + KNOWN-ISSUES
- Verifikasi rilis: `node --check` semua file, uji loader/dispatcher dengan event palsu, migrasi ganda

## 1.0.1
- Perbaikan: `better-sqlite3` dipindah ke `optionalDependencies` dan dinaikkan ke 12.11.1 (ada binary siap pakai untuk Node 26). Sebelumnya `npm install` bisa gagal total di Node 26 karena kompilasi dari source.
- Baru: DB aplikasi otomatis memakai `node:sqlite` bawaan Node 22.13+ bila `better-sqlite3` tidak terpasang. Bot tetap jalan tanpa modul native.
- Perbaikan: `WaClient` memakai `ConsoleLogger` bawaan zapo-js.
- Syarat Node dinaikkan menjadi >= 22.13.

## 1.0.2
- Perbaikan: `USE_PAIRING_CODE=true` sekarang benar-benar meminta pairing code (sebelumnya QR tetap muncul karena event `auth_qr` selalu menampilkan QR). Bila permintaan kode gagal, otomatis beralih ke QR.

## 1.1.0
- Baru: `plugins/menu/` berisi 7 contoh jenis menu (gambar, dokumen palsu, video/GIF, tombol, list, CTA, kartu thumbnail) dan indeks `.menus`.
- Baru: `lib/rich.js` (pembuat tombol native flow, `sendRich` dengan fallback, helper teks menu) dan aset contoh di `assets/`.
- Baru: balasan tombol/list dibaca sebagai teks sehingga `id` berisi perintah langsung dijalankan.
- Baru: `docs/13-menu-types.md`.

## 1.1.1
- Perbaikan: `.menuad` kini punya 3 varian (`.menuad 1/2/3`) karena varian `externalAdReply` tidak sampai ke penerima di uji lapangan. Bawaan memakai link-preview klasik (varian 3).

## 1.1.2
- Baru: `.menubtn 1` (buttonsMessage resmi) dan `.menulist 1` (listMessage resmi) sesuai docs zapo; `lib/rich.js` punya `buildButtonsMessage`, `buildListMessage`, `sendShape`.
- Perbaikan: semua varian `.menuad` membawa `matchedText`/URL (docs zapo: itu yang membuat extendedTextMessage diklasifikasikan sebagai pesan link). Varian 2 memakai `options.contextInfo`.
- Perbaikan: nativeFlowMessage memakai `messageVersion: 1`.

## 1.2.0
- Baru: API `ctx.rich.*` — satu fungsi per jenis pesan (`ad`, `buttons`, `list`, `cta`, `interactive`, `image`, `video`, `gif`, `audio`, `voice`, `document`, `sticker`, `location`, `contact`, `contacts`, `poll`, `groupInvite`, `text`) dengan opsi umum `to`, `quote`, `fallback`.
- Baru: `url` bisa berupa URL penuh, nama kunci link (`'website'`, `'support'`), atau fungsi. Link bernama di `config/links.js` dan `.env` (`LINK_*`); bawaan `https://zapo.to`.
- Baru: modul `lib/rich/` (builders murni + fasad), `build.xxx` untuk membangun pesan tanpa kirim, dan `ctx.rich.menuText()` / `ctx.rich.sections()`.
- Baru: `plugins/menu/exampleCommands.js` berisi 14 contoh lengkap berkomentar (semua `enabled: false`) dan `docs/14-rich-api.md`.
- Perubahan: plugin di `plugins/menu/` kini tipis (memanggil `ctx.rich`). Thumbnail kartu memakai `jpegThumbnail`.
- Kompatibilitas: `lib/rich.js` lama tetap ada (deprecated).
