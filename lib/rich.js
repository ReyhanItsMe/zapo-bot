// lib/rich.js — DEPRECATED (v1.1.x). Dipertahankan agar plugin lama tidak rusak.
// Pakai ctx.rich.* (lib/rich/api.js) atau import dari './rich/index.js'. Lihat docs/14-rich-api.md.
export {
  assetPath, hasAsset, readAsset,
  btn, buildInteractive, buildButtonsMessage, buildListMessage,
  sendRich, sendShape, sendOrText,
  menuText, listSections, groupByCategory, section, row
} from './rich/index.js'
