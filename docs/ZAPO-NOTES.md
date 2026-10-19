# ZAPO-NOTES — Catatan Docs Zapo (Fase 1)

> Dibuat dari satu kali pembacaan `https://zapo.to/llms-full.txt` (chunk awal: Architecture + Authentication)
> ditambah pengetahuan riset sesi sebelumnya (Quickstart, Installation, Sending/Receiving Messages, Media,
> Groups, Events, Reconnection, Errors, Production, Migrating-from-Baileys di zapo.to).
> **Setelah file ini selesai, kode TIDAK lagi mengacu ke internet — hanya ke catatan ini.**
> Hal yang tidak terkonfirmasi ditandai `tidak ditemukan` dan di kode diberi `// TODO(verify)`.

## 1. Import & membuat client

- Package inti: `zapo-js` (ESM/CJS, named exports saja, tanpa default export).
- Import yang terkonfirmasi dari Quickstart/README npm:

```js
import { WaClient, createStore, ConsoleLogger, createPinoLogger } from 'zapo-js'
import { createSqliteStore } from '@zapo-js/store-sqlite'
```

- Membuat client: `new WaClient({ store, sessionId: 'default' }, logger)` lalu `await client.connect()`.
- Client hanya punya surface kecil: `connect()`, `disconnect()`, `logout()`, `getState()`, `getCredentials()`,
  typed emitter `on/once/off`. Semua fitur lewat coordinator getter (lazily wired, aman disimpan referensinya).
- Logger: `ConsoleLogger('info')` bawaan, atau `await createPinoLogger({ level, pretty })` (butuh peer `pino`).
  Proyek ini memakai logger sendiri di `lib/logger.js` yang **hanya** mengandalkan bentuk minimal
  `{ info, warn, error, debug }` — TODO(verify): apakah WaClient menerima logger custom berbentuk plain object
  dengan method tersebut, atau wajib instance logger bawaan zapo-js. Lihat KNOWN-ISSUES.

## 2. Store SQLite (auth/signal)

- Paket: `@zapo-js/store-sqlite`, fungsi `createSqliteStore({ path, driver: 'auto' })`.
  Peer: `better-sqlite3` (opsional — fallback `node:sqlite` di Node 22.13+/Bun bila better-sqlite3 absen).
- Pola resmi:

```js
const store = createStore({
  backends: { sqlite: createSqliteStore({ path: '.auth/state.sqlite', driver: 'auto' }) },
  providers: {
    auth: 'sqlite', signal: 'sqlite', preKey: 'sqlite', session: 'sqlite',
    identity: 'sqlite', senderKey: 'sqlite', appState: 'sqlite', privacyToken: 'sqlite',
    messages: 'sqlite', threads: 'sqlite', contacts: 'sqlite' // 'none' untuk skip arsip
  }
})
```

- Kredensial tersimpan **otomatis** oleh store — tidak ada `creds.update` manual seperti Baileys.
- Backend lain tersedia: `@zapo-js/store-postgres|mysql|redis|mongo` (tidak dipakai base ini).
- Store in-memory bawaan ada untuk testing (hilang saat restart) — tidak dipakai.

## 3. Coordinator (getter di client)

`client.auth` (pairing/kredensial), `client.message` (kirim/terima/receipt/download/addon),
`client.presence`, `client.chat` (mute/pin/archive/read/delete), `client.group` (grup & komunitas),
`client.newsletter`, `client.status`, `client.broadcastList`, `client.privacy`, `client.profile`,
`client.business`, `client.bot`, `client.email`, `client.lowlevel` (raw node escape hatch),
`client.voip` (hanya bila plugin `@zapo-js/voip` dipasang — **tidak dipakai** base ini).

## 4. Event yang dipakai proyek ini

| Event | Payload (sesuai docs) | Dipakai di |
|---|---|---|
| `auth_qr` | `{ qr: string, ttlMs: number }` — terbit ulang tiap QR rotasi | connection.js |
| `auth_pairing_code` | `{ code: string }` | connection.js |
| `auth_pairing_required` | `{ forceManual: boolean }` — saatnya memanggil `requestPairingCode` | connection.js |
| `auth_passkey_required` | `{ hasSigner: boolean }` — server memaksa passkey (Shortcake); tanpa signer handshake berhenti | connection.js (log saja) |
| `auth_paired` | `{ credentials }`, `credentials.meJid` | connection.js |
| `connection` | union: `{ status:'open', isNewLogin }` / `{ status:'close', reason, code, isLogout }` | events/connection.js |
| `message` | `WaIncomingMessageEvent`: `{ key: { remoteJid, id, fromMe?, participant? }, message: Proto.IMessage, pushName?, ... }` | events/message.js |
| `message_addon` | reaksi / vote poll yang terdekripsi | tidak diroute ke command (dijadikan `m.reaction` bila menyatu di message) — TODO(verify) bentuk pastinya |
| `message_protocol` | edit/revoke | serialize (pendeteksian type) |
| `receipt` | delivery/read/played receipt | diabaikan base ini |
| `presence` / `chatstate` | presence & typing/recording | diabaikan base ini |
| `group` | `WaGroupEvent` — perubahan grup (create/subject/participants/settings) | events/group-update.js — TODO(verify): diskriminator/field aksi pastinya tidak ditemukan lengkap di chunk yang dibaca |
| `call` | `WaIncomingCallEvent` — signaling panggilan masuk | events/call.js — TODO(verify): field id/status & cara reject via coordinator tidak ditemukan lengkap |
| `stream_failure` | `{ failureReason, failureCode, failureMessage, failureUrl }` | connection.js (log) |
| `stanza_error` | `{ code, text }` per-stanza ditolak, koneksi tetap hidup | connection.js (log) |

Bentuk `message` (dari Quickstart & Receiving-messages pada riset sebelumnya):
teks ada di `event.message.conversation` atau `event.message.extendedTextMessage.text`;
caption media di `imageMessage.caption` / `videoMessage.caption` / `documentMessage.caption`;
quote di `extendedTextMessage.contextInfo.quotedMessage` (+ `stanzaId`, `participant`);
mention di `contextInfo.mentionedJid`. JID pengirim grup di `event.key.participant` / `participantAlt`,
chat di `event.key.remoteJid` / `remoteJidAlt` (PN `@s.whatsapp.net`, grup `@g.us`, LID `@lid`).
TODO(verify): nama field Alt persis (`participantAlt`/`remoteJidAlt`) dan bentuk `key` lengkap.

## 5. Mengirim pesan — `client.message.send(to, content, options?)`

Resolve ke `WaMessagePublishResult` (punya `.id`) setelah server ack. `to` = JID tujuan.

- Teks: `send(jid, 'halo')` atau `send(jid, { type:'text', text, linkPreview: true|false|{title,description} })`
- Reply/quote: `send(jid, content, { quote: event })` — quote menerima event / key / WaQuoteRef.
- Mention: `send(groupJid, { type:'text', text:'Hai @628xx' }, { mentions: ['628xx@s.whatsapp.net'] })`
  (teks harus memuat `@nomor` agar ter-render).
- Gambar: `{ type:'image', media, mimetype:'image/jpeg', caption }` — `media`: path string (disarankan) |
  Readable | Uint8Array. Video: `{ type:'video', media, mimetype:'video/mp4', caption, gifPlayback }`,
  PTV: `type:'ptv'`. Audio: `{ type:'audio', media, mimetype }`, voice note tambah `ptt:true`
  (ideal `audio/ogg; codecs=opus`). Dokumen: `{ type:'document', media, mimetype, fileName, caption }`.
  Stiker: `{ type:'sticker', media, mimetype:'image/webp' }`; sticker-pack `type:'sticker-pack'`.
- Reaksi: TODO(verify) — diduga content union `{ type:'reaction', ... }` (interactive-messages guide);
  bentuk persis tidak terkonfirmasi dari chunk yang dibaca → dibungkus helper dengan fallback raw proto.
- Poll: `{ type:'poll', ... }` (typed, interactive guide) — base ini tidak mengirim poll.
- View-once: opsi `{ viewOnce:true }`. Forward: `{ forward:true|{score} }`. Edit: opsi `editKey`.
- Raw proto: `send(jid, { conversation: '...' })` atau `Proto.IMessage` apa pun (location, vCard,
  interactive native-flow/button/list, product, order, PIX) via `import { proto } from 'zapo-js'` — TODO(verify) nama ekspor `proto`.
- Mimetype: bila tidak diisi & ada media processor dengan `detectMimetype`, dideteksi otomatis;
  tanpa itu builder throw untuk image/video/audio/document/ptv. Stiker default `image/webp`.
- Upload sekali pakai berkali-kali: `client.message.upload(source, { type, mimetype })`.
- Download media masuk: fungsi di message coordinator — TODO(verify): nama persis
  (`downloadMediaMessage` disebut di docs media) & signature-nya tidak terkonfirmasi.

## 6. Grup — `client.group`

Terkonfirmasi dari Groups guide (riset sebelumnya):
`queryAllGroups()`, `queryGroupMetadata(jid)` → `WaGroupMetadata { jid, subject, owner, participants:
[{ jid?, id?, isAdmin, isSuperAdmin }], announce, restrict, ephemeral, ... }` (TODO(verify): field id peserta persis),
`createGroup(subject, jids[])`, `addParticipants/removeParticipants/promoteParticipants/demoteParticipants(jid, jids[])`
→ array hasil per-JID `{ jid, status, code }` (403 privacy, 408 not allowed, 409 already, 404 not on WA),
`setSubject`, `setDescription`, `setSetting(jid, 'announcement'|'restrict'|'ephemeral'|..., bool)`,
`setEphemeralDuration`, `setMemberAddMode/setMemberLinkMode/setMemberShareGroupHistoryMode`,
`queryGroupInviteInfo(code)`, `queryInviteCode(jid)`, `joinGroupViaInvite(code)`, `revokeInvite(jid)`,
`leaveGroup([jid])`, `queryMembershipApprovalRequests`, `approveMembershipRequests`,
`rejectMembershipRequests`, `cancelMembershipRequests`, komunitas: `createCommunity`,
`linkSubGroups/unlinkSubGroups`, `fetchSubGroups`, `joinLinkedGroup`, `queryLinkedGroupsParticipants`,
`deactivateCommunity`, `transferCommunityOwnership`.
Cek admin = cari peserta dengan JID/LID sender di metadata lalu lihat `isAdmin||isSuperAdmin`.

## 7. Pairing code, reconnect, logout

- Pairing code: setelah koneksi terbuka & event `auth_pairing_required`,
  `await client.auth.requestPairingCode('62xxxxxxxxxx' /* digit saja, kode negara */)` →
  string 8 karakter; signature `requestPairingCode(phoneNumber, shouldShowPushNotification?, customCode?)`.
  Di HP: Perangkat tertaut → Tautkan dengan nomor telepon.
- Zapo **tidak auto-reconnect** (by design). Pola resmi: dengar `connection` close →
  bila `isLogout:true` JANGAN reconnect (pairing ulang); selain itu reconnect `client.connect()`
  dengan exponential backoff (contoh docs: 1s → ×2 → cap 30s).
- Kode fatal (stop, jangan retry): 401 not-authorized, 402 temporary banned (backoff keras),
  403 locked, 405 client-too-old (naikkan opsi `version` / `recoverFromClientTooOld:true`),
  406 banned, 409 bad user-agent, 516 forced-logout. Kode 515 force-login = rutin, reconnect biasa.
- `disconnect()` = tutup socket, kredensial tetap (untuk shutdown). `logout()` = unlink server-side +
  hapus state (pairing ulang). Credentials bisa dibaca sinkron: `client.getCredentials()?.meJid`.
- Passkey (Shortcake): opsi `signPasskeyAssertion` di WaClientOptions; tanpa signer pemilik akun,
  link di akun passkey-gated tidak bisa selesai — base ini hanya me-log peringatan.

## 8. Opsi WaClient yang dipakai

`{ store, sessionId, connectTimeoutMs, nodeQueryTimeoutMs, history: { enabled, requireFullSync },
markOnlineOnConnect (default false), plugins: [...] }`. TODO(verify): nama persis sebagian opsi
(`iqTimeoutMs`, `keepAliveIntervalMs`, `deadSocketTimeoutMs`, `media: { processor }`,
`linkPreview`) — hanya yang terkonfirmasi dari Quickstart/Production yang dipakai tanpa TODO;
sisanya dibungkus defensif.

## 9. `@zapo-js/media-utils` & `@zapo-js/native`

- `@zapo-js/media-utils`: `createMediaProcessor()` → `WaMediaProcessor` (thumbnail, dimensi,
  waveform voice-note, normalisasi). Peer: `sharp`, `file-type` (opsional, deteksi mimetype),
  dan binary sistem `ffmpeg`/`ffprobe` di PATH. Tanpa processor, media tetap terkirim tapi
  tanpa thumbnail/preview/waveform. Cara wire: opsi `media: { processor }` di WaClient —
  TODO(verify) bentuk persis opsi ini.
- `@zapo-js/native`: akselerator Rust (build WASM di npm) untuk X25519 ECDH & XEdDSA sign/verify,
  **auto-detect** saat terpasang, fallback JS murni bila absen; env `ZAPO_NATIVE_BACKEND=js|auto`.
  Butuh Node >= 20.19.0. Tidak perlu kode apa pun dari sisi bot.

## 10. Tidak ditemukan / tidak terkonfirmasi (jujur)

- Bentuk payload diskriminator event `group` (field aksi add/remove/promote) — **tidak ditemukan lengkap**.
- Cara menolak panggilan via API (method coordinator untuk reject call) — **tidak ditemukan**.
- Signature persis reaksi `{ type:'reaction' }`, poll, dan `downloadMediaMessage` — **tidak ditemukan** di chunk yang dibaca.
- Nama ekspor `proto` dari `zapo-js` — **tidak ditemukan** di chunk yang dibaca.
- Apakah logger custom plain-object diterima WaClient — **tidak ditemukan**.
- Nama opsi `media: { processor }`, `iqTimeoutMs` dkk. — sebagian **tidak ditemukan**.
- Mekanisme `client.presence` untuk mark-read / auto-read receipt — **tidak ditemukan** lengkap;
  docs menyebut receipt ditangani message coordinator — TODO(verify).
- Semua butir di atas → di kode diberi `// TODO(verify): ...` dan dicatat di `docs/KNOWN-ISSUES.md`.
