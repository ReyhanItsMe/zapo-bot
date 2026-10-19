# 01 — Memulai (Getting Started)

Panduan tercepat dari nol sampai bot membalas pesan pertamamu.

## Yang kamu butuhkan

1. **Node.js >= 22.13** (disarankan 22 LTS; 24 dan 26 juga bisa) — cek: `node --version`
2. **Satu nomor WhatsApp khusus bot** yang aktif di HP (untuk scan QR / pairing). Jangan pakai nomor pribadi.
3. Folder proyek ini hasil ekstrak `zapo-bot.zip`.

## Langkah

```bash
# 1. Salin contoh konfigurasi, lalu EDIT isinya
cp .env.example .env

# 2. Install dependency
npm install

# 3. Jalankan bot
npm start
```

Saat pertama jalan, bot menampilkan **QR code** di terminal. Buka WhatsApp di HP nomor bot → **Perangkat tertaut → Tautkan perangkat** → scan. Berhasil bila log menampilkan `Berhasil tertaut sebagai ...`.

Alternatif tanpa scan: set di `.env` → `USE_PAIRING_CODE=true` dan `PAIRING_NUMBER=628xxxx`, lalu masukkan kode 8 karakter lewat *Perangkat tertaut → Tautkan dengan nomor telepon*.

## Uji pertama

Kirim pesan ke nomor bot dari nomor lain:

| Kirim | Hasil yang diharapkan |
|---|---|
| `ping` *(bukan perintah — hanya contoh event; abaikan bila tak dibalas)* | — |
| `.ping` | 🏓 Pong! + waktu respon |
| `.menu` | Daftar perintah aktif |
| `.info` | Info akunmu & sisa limit |

> Perintah bot diawali **prefix** (default `.`). Kata `ping` tanpa titik tidak dianggap perintah.

## Setelah ini

- Isi `OWNER_NUMBERS` di `.env` dengan nomormu sendiri agar perintah owner (`.ban`, `.reload`) bisa kamu pakai.
- Aktifkan contoh perintah: `05-plugin-guide.md`
- Atur fitur (antilink, welcome, limit): `03-configuration.md`
- Deploy 24 jam di panel/VPS: `02-installation.md`
