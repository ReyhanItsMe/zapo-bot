// lib/rich/index.js — pintu masuk modul menu/pesan kaya. Lihat docs/14-rich-api.md.
export { createRichApi } from './api.js'
export { build, DEFAULTS } from './builders.js'
export { sendBuilt, sendRich, sendShape, sendOrText } from './send.js'
export { btn, buildInteractive, buildButtonsMessage, buildListMessage } from './native.js'
export { assetPath, hasAsset, readAsset, resolveMedia, toBuffer } from './assets.js'
export { resolveUrl, DEFAULT_URL } from './links.js'
export { menuText, listSections, groupByCategory, section, row } from './text.js'
