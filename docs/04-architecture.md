# 04 — Arsitektur

## Alur pesan masuk

```
WhatsApp ──► client (zapo-js) ──► events/message.js ──► dispatcher
                                                            │
                              lib/serialize.js (event → m)  │
                                                            ▼
                              core/context.js (bangun ctx)  │
                                                            ▼
   01-ignore-self → 02-parse → 03-ban-check → 04-cooldown
        → 05-permission → 06-limit → plugin.run(ctx)
                                                            │
                              ctx.reply / ctx.send ──► lib/queue.js
                              (jeda acak + konkurensi) ──► client.message.send ──► WhatsApp
```

## Tanggung jawab tiap bagian

| Bagian | Tanggung jawab |
|---|---|
| `main.js` | Boot berurutan, pasang event, shutdown rapi |
| `core/client.js` | Membuat `WaClient` + store; memuat media processor opsional |
| `core/connection.js` | QR/pairing, reconnect backoff, klasifikasi error fatal, status |
| `core/loader.js` | Muat middleware (urut), event, plugin (rekursif); `reload()` |
| `core/dispatcher.js` | serialize → ctx → rantai middleware → plugin; error ramah |
| `core/context.js` | Objek `ctx` untuk plugin (kontrak di 05) |
| `events/*` | Pendengar tipis per event zapo-js → meneruskan ke dispatcher/connection |
| `middlewares/*` | Filter berurutan sebelum command (kontrak di 06) |
| `plugins/**` | Fitur bot — **folder utama yang kamu edit** |
| `services/*` | Logika dipakai >1 plugin (user, grup, media, api, scheduler) |
| `lib/*` | Helper murni tanpa config/DB (serialize, jid, format, queue, logger) |
| `lib/rich/*` | Pembuat pesan kaya (kartu, tombol, list, media) dan fasad `ctx.rich` |
| `store/auth.js` | Sesi zapo-js → `data/auth/state.sqlite` |
| `store/app-db.js` | DB aplikasi → `data/app.sqlite` (users/groups/settings/meta) |

## Prinsip desain

1. **Plugin tipis, service tebal** — logika bersama masuk `services/`, plugin hanya mengorkestrasi.
2. **Semua kirim pesan lewat antrean** (`lib/queue.js`) — jeda acak kecil + batas konkurensi untuk mengurangi risiko pembatasan akun.
3. **Tidak ada crash karena satu fitur** — error plugin/middleware/event ditangkap, dicatat di log, pengguna menerima pesan ramah.
4. **Dua SQLite terpisah** — mengotori/menghapus DB aplikasi tidak menyentuh sesi WhatsApp, dan sebaliknya.
