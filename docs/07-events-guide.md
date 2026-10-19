# 07 — Panduan Event

Event adalah pendengar kejadian dari zapo-js di folder `events/` — satu file per event.

## Kontrak

```js
export default {
  name: 'message',        // nama event zapo-js
  once: false,            // true = hanya jalan sekali
  async run({ client, app }, event) {
    // app = { config, db, services, dispatcher, log, connection, queue, loader }
  }
}
```

Semua handler dibungkus try/catch oleh `main.js` — error di satu event tidak membunuh bot.

## Event bawaan

| File | Event zapo-js | Fungsi |
|---|---|---|
| `events/message.js` | `message` | (Opsional) tandai dibaca, lalu serahkan ke dispatcher |
| `events/group-update.js` | `group` | Sambutan anggota join/leave bila fitur welcome aktif |
| `events/call.js` | `call` | Pencatatan panggilan masuk (antiCall) |
| `events/connection.js` | `connection` | Meneruskan status koneksi ke `core/connection.js` |

Event autentikasi (`auth_qr`, `auth_paired`, `auth_pairing_required`, dll) di-bind langsung oleh `core/connection.js`, bukan lewat folder ini, agar aktif sejak awal boot.

## Menambah event

1. Buat file baru di `events/`, mis. `events/receipt.js`.
2. Isi `name` sesuai nama event zapo-js (daftar lengkap: `docs/ZAPO-NOTES.md` §4).
3. Restart bot.

Catatan kejujuran teknis: sebagian bentuk payload event (khususnya `group` dan `call`) dibaca secara defensif karena dokumentasinya tidak lengkap — lihat `KNOWN-ISSUES.md`. Bila fitur welcome/antiCall tidak bereaksi, aktifkan `LOG_LEVEL=debug` dan periksa bentuk event asli di log.
