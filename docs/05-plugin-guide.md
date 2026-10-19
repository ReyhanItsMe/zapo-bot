# 05 — Panduan Plugin

Plugin adalah cara kamu menambah perintah bot. Satu file di `plugins/<kategori>/` mengekspor **satu objek plugin** atau **array berisi beberapa plugin**.

## Kontrak plugin

```js
export default {
  command: ['sticker', 's'],   // nama perintah (array boleh >1 = alias), huruf kecil, TANPA prefix
  category: 'media',           // kelompok di menu; default = nama folder
  description: 'Ubah gambar jadi stiker',  // tampil di .menu
  usage: '.sticker (reply gambar)',        // contoh pemakaian di .menu
  access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
  cooldown: 5,                 // jeda anti-spam per user (detik), 0 = tanpa cooldown
  enabled: true,               // false = dilewati loader
  async run(ctx) { /* logikamu */ }
}
```

Aturan loader:
- Dimuat **rekursif** dari `plugins/**`; file berawalan `_` dilewati (berguna untuk draf).
- `enabled: false` dilewati (semua isi `exampleCommands.js` begini).
- **Nama command ganda**: kemunculan kedua ditolak + peringatan di log, bot tidak crash.

## Objek ctx (yang diterima run)

| Properti | Isi |
|---|---|
| `ctx.client` | WaClient zapo-js (`client.message`, `client.group`, ...) |
| `ctx.event` | Event mentah zapo-js |
| `ctx.m` | Pesan terserialisasi (lihat di bawah) |
| `ctx.command` / `ctx.args` / `ctx.text` / `ctx.prefix` | Hasil parse: nama perintah, argumen per kata, sisa teks utuh, prefix terpakai |
| `ctx.config` | Konfigurasi gabungan (.env + config/) |
| `ctx.db` | DB aplikasi (`getUser`, `setBanned`, `getGroupSetting`, `raw`, ...) |
| `ctx.services` | `user`, `group`, `media`, `api`, `scheduler`, `menu` |
| `ctx.reply(content)` | Balas ke chat ini (quoted otomatis, lewat antrean) |
| `ctx.send(jid, content)` | Kirim ke chat mana pun (lewat antrean) |
| `ctx.react(emoji)` | Reaksi emoji ke pesan pemicu |
| `ctx.rich.*` | Menu & pesan kaya: `ad`, `buttons`, `list`, `cta`, `image`, `document`, `location`, dll. (`docs/14-rich-api.md`) |
| `ctx.log` | Logger (`info/warn/error/debug`) |
| `ctx.isOwner` `ctx.isAdmin` `ctx.isBotAdmin` `ctx.isPremium` `ctx.isGroup` | Bendera konteks pengirim |

`content` untuk reply/send: string teks, atau objek typed zapo-js, contoh: `{ type:'image', media, mimetype, caption }`, `{ type:'sticker', media, mimetype:'image/webp' }`, `{ type:'text', text }` dengan opsi ketiga `{ mentions: [jid] }`.

## Objek m

`raw, key, id, chat, sender, senderNumber, pushName, isGroup, fromMe, type, text` (termasuk caption media), `quoted` (null atau `{ id, sender, type, text, message }`), `mentions, timestamp`. Di grup, `sender` bisa berupa **LID** (`@lid`) — jangan asumsikan selalu nomor (`senderNumber` kosong untuk LID murni).

## access — siapa yang boleh memakai

| Field | Arti |
|---|---|
| `owner: true` | Hanya nomor di `OWNER_NUMBERS` |
| `admin: true` | Hanya admin grup (owner bot selalu lolos) |
| `botAdmin: true` | Bot wajib jadi admin grup |
| `group: true` | Hanya di grup · `private: true` hanya di chat pribadi |
| `premium: true` | Hanya user premium/owner |
| `limit: N` | Memotong N kuota harian per pemakaian (0 = gratis) |

## Cara mengaktifkan contoh

1. Buka `plugins/<kategori>/exampleCommands.js`, pilih contoh, salin objeknya.
2. Tempel ke file baru, mis. `plugins/media/sticker.js`.
3. Ubah `enabled: false` → `true`.
4. Restart bot, atau (owner) kirim `.reload`.

## Tips

- Satu perintah = satu tanggung jawab; logika bersama pindah ke `services/`.
- Selalu validasi `ctx.args`/`ctx.m.quoted` dan balas dengan contoh pemakaian bila salah — jangan diam.
- Bungkus pekerjaan berisiko (API luar, media) dengan try/catch dan pesan ramah; dispatcher juga menangkap error sebagai jaring terakhir.
