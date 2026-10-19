# Known Issues & TODO(verify)

Daftar jujur hal yang **belum terverifikasi ke dokumentasi zapo-js** saat base ini ditulis
(sumber catatan: `docs/ZAPO-NOTES.md` §10). Setiap butir punya perilaku aman di kode:
bot tidak crash — fitur terkait memberi pesan jelas atau hanya mencatat log.
Perbaiki butir di bawah dengan membuka dokumentasi resmi zapo.to, lalu hapus dari daftar ini.

| # | Lokasi di kode | Hal yang perlu diverifikasi | Perilaku aman saat ini |
|---|---|---|---|
| 1 | `core/client.js` (`// TODO(verify): logger plain-object`) | Apakah `WaClient` menerima logger plain object `{info,warn,error,debug}`, atau wajib `ConsoleLogger`/`createPinoLogger` dari zapo-js | SUDAH DIPERBAIKI: `core/client.js` kini memakai `ConsoleLogger` dari zapo-js |
| 2 | `core/client.js` (`media: { processor }`) | Nama & bentuk opsi untuk memasang `WaMediaProcessor` ke `WaClientOptions` | Processor gagal terpasang pun media tetap terkirim (tanpa thumbnail/waveform) |
| 3 | `events/group-update.js` | Diskriminator & field aksi event `group` (add/remove/promote, daftar peserta) | Payload dibaca dari banyak kandidat field; yang tidak dikenali hanya dicatat log debug — fitur welcome mungkin tidak bereaksi sampai disesuaikan |
| 4 | `events/call.js` | Field event `call` dan method coordinator untuk menolak panggilan | Panggilan hanya dicatat & diabaikan (antiCall = log-only) |
| 5 | `services/media.js` `download()` | Nama & signature API unduh media zapo-js (`downloadMediaMessage`?) dan bentuk objek media | Mencoba beberapa kandidat method umum, lalu throw pesan jelas yang ditangkap plugin menjadi balasan ramah |
| 6 | `events/message.js` (autoRead) | API mark-read/receipt zapo-js untuk menandai pesan dibaca | Mencoba `client.message.markRead/sendReceipt/readMessages` secara defensif; gagal = diabaikan |
| 7 | `lib/serialize.js` | Nama persis field Alt (`remoteJidAlt`/`participantAlt`) dan field `contextInfo` (`stanzaId`, `participant`, `mentionedJid`) pada event `message` | Semua dibaca dari beberapa kandidat nama; fallback wajar (quoted null, mentions kosong) |
| 8 | `core/context.js` `ctx.react()` | Bentuk typed content reaksi (`{ type:'reaction', ... }`) | Mencoba typed content, fallback raw proto `reactionMessage` melalui `client.message.send` |
| 9 | `services/group.js` | Field id peserta `WaGroupParticipant` (`jid`/`id`/`lid`) | `participantId()` mencoba `jid → id → lid → phoneNumber` |
| 10 | `core/connection.js` | Sebagian nama `reason` pada event `connection` close | Kode numerik (401/402/403/405/406/409/516) jadi jangkar utama; reason tak dikenal = reconnect backoff biasa |
| 11 | `store/auth.js` | — (terkonfirmasi) | `driver:'auto'` memilih better-sqlite3 atau `node:sqlite` |

## Batasan desain yang disengaja (bukan bug)

- Satu proses = satu nomor/sesi (multi-session satu proses tidak diaktifkan di base ini).
- Cooldown disimpan di memori — reset saat restart.
- Scheduler berbasis interval/cek menit, bukan cron persisten; pengingat contoh (`ingatkan`) hilang saat restart.
- Boot nyata sampai QR **belum teruji di lingkungan build ini** (tidak ada nomor WhatsApp untuk pairing) — uji pertama dilakukan pembeli mengikuti `docs/01-getting-started.md`.

## Menu interaktif (v1.1.0)
- `lib/rich.js` dan `plugins/menu/*`: raw proto `interactiveMessage` (tombol/list/CTA) dan `externalAdReply` belum terverifikasi, baik penerimaannya oleh `client.message.send()` maupun rendering di klien. `sendRich()` jatuh ke teks biasa bila gagal terkirim; uji di HP nyata. Lihat `docs/13-menu-types.md`.
- `lib/serialize.js` (`extractInteractiveReply`): nama field payload balasan tombol/list di zapo-js mengikuti proto WhatsApp. Kalau menekan tombol tidak menjalankan perintah, cek payload event di log.
- `ctx.rich.audio` (mimetype voice note) dan `poll.selectableCount` mengikuti tebakan standar WhatsApp; cek `docs/14-rich-api.md` bagian Status verifikasi.
- `ctx.rich.image/video` dengan media berupa URL http(s) belum terverifikasi di zapo-js; pakai file lokal atau Buffer.
