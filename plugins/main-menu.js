import { promises as fs} from 'fs'
import { join} from 'path'
import { xpRange} from '../lib/levelling.js'

let tags = {
  info: 'ɪɴғᴏʀᴍᴀᴄɪᴏ́ɴ',
  anime: 'ᴀɴɪᴍᴇ & ᴡᴀɪғᴜs',
  buscador: 'ʙᴜsᴄᴀᴅᴏʀᴇs',
  downloader: 'ᴅᴇsᴄᴀʀɢᴀs',
  economy: 'ᴇᴄᴏɴᴏᴍɪ́ᴀ & ᴊᴜᴇɢᴏs',
  fun: 'ᴊᴜᴇɢᴏs ᴅɪᴠᴇʀᴛɪᴅᴏs',
  group: 'ғᴜɴᴄɪᴏɴᴇs ᴅᴇ ɢʀᴜᴘᴏ',
  ai: 'ɪɴᴛᴇʟɪɢᴇɴᴄɪᴀ ᴀʀᴛғɪᴄɪᴀʟ',
  game: 'ᴊᴜᴇɢᴏs ᴄʟᴀ́sɪᴄᴏs',
  serbot: 'sᴜʙ-ʙᴏᴛs',
  main: 'ᴄᴏᴍᴀɴᴅᴏs ᴘʀɪɴᴄɪᴘᴀʟᴇs',
  nable: 'ᴀᴄᴛɪᴠᴀʀ / ᴅᴇsᴀᴄᴛɪᴠᴀʀ',
  nsfw: 'ɴsғᴡ',
  owner: 'ᴅᴜᴇñᴏ / ᴀᴅᴍɪɴ',
  sticker: 'sᴛɪᴄᴋᴇʀs & ʟᴏɢᴏs',
  herramientas: 'ʜᴇʀʀᴀᴍɪᴇɴᴛᴀs'
}

const defaultMenu = {
  before: `
*─ׄ─ׅ─ׄ─⭒ Bienvenido %name ⭒─ׄ─ׅ─ׄ─*
“Hola *%name*, soy *Shadow Bot*, %greeting”

╭── 👤 Shadow Ultra MD
│ 🍬 Modo: *Público*
│ 📚 Baileys: *Multi Device*
│ ⏱ Tiempo Activo: *%uptime*
│ 👤 Usuarios: *%totalreg*
╰─────────────── %readmore
*─ׄ─ׅ─ׄ─⭒ MENÚ DE COMANDOS ⭒─ׄ─ׅ─ׄ─*
`.trim(),

  header: `
╭── ⭒ *%category*
│ 
`.trim(),

  body: '│ ➩ %cmd %islimit %isPremium',
  footer: '╰──────────\n',
  after: ''
}

let handler = async (m, { conn, usedPrefix: _p, __dirname}) => {
  try {
    let _package = JSON.parse(await fs.readFile(join(__dirname, '../package.json')).catch(() => '{}')) || {}
    let { exp, limit, level} = global.db.data.users[m.sender]
    let { min, xp, max} = xpRange(level, global.multiplier)
    let name = await conn.getName(m.sender)
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    let totalreg = Object.keys(global.db.data.users).length
    let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered).length

    let help = Object.values(global.plugins).filter(plugin =>!plugin.disabled).map(plugin => ({
      help: Array.isArray(plugin.help)? plugin.help: [plugin.help],
      tags: Array.isArray(plugin.tags)? plugin.tags: [plugin.tags],
      prefix: 'customPrefix' in plugin,
      limit: plugin.limit,
      premium: plugin.premium,
      enabled:!plugin.disabled
}))

    for (let plugin of help) {
      if (plugin && plugin.tags) {
        for (let tag of plugin.tags) {
          if (!(tag in tags)) tags[tag] = tag
        }
      }
    }

    let menuText = [
      defaultMenu.before,
...Object.keys(tags)
        // Solo incluye categorías con comandos disponibles y activos
        .filter(tag => help.some(menu => menu.tags.includes(tag) && menu.help))
        .map(tag => {
          let section = help.filter(menu => menu.tags.includes(tag) && menu.help)
            .map(menu => menu.help.map(cmd =>
              defaultMenu.body
                .replace(/%cmd/g, menu.prefix? cmd: _p + cmd)
                .replace(/%islimit/g, menu.limit? '◜⭐◞': '')
                .replace(/%isPremium/g, menu.premium? '◜🪪◞': '')
            ).join('\n')).join('\n')

          if (section.trim()) {
            return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + section + '\n' + defaultMenu.footer
          }
          return ''
        }),
      defaultMenu.after
    ].join('\n')

    let greeting = getGreeting()
    let replace = {
      '%': '%',
      p: _p,
      uptime,
      _uptime,
      taguser: '@' + m.sender.split("@")[0],
      name,
      level,
      limit,
      exp: exp - min,
      maxexp: xp,
      totalexp: exp,
      xp4levelup: max - exp,
      totalreg,
      rtotalreg,
      greeting,
      textbot: 'Gracias por usar a Shadow-Bot!',
      readmore: String.fromCharCode(8206).repeat(4001)
}

    let text = menuText.replace(new RegExp(`%(${Object.keys(replace).join('|')})`, 'g'), (_, key) => replace[key])

    await m.react('🌱')
    await conn.sendMessage(m.chat, {
      video: { url: 'https://cdn.russellxz.click/14cf14e9.mp4'},
      gifPlayback: true,
      caption: text.trim(),
      mentions: [m.sender],
      contextInfo: {
        externalAdReply: {
          title: 'Shadow Ultra MD',
          body: 'Shadow Bot',
          thumbnailUrl: 'https://files.catbox.moe/12zb63.jpg',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
}, { quoted: m})

} catch (e) {
    await m.react('✖️')
    throw e
}
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'help', 'menú']
handler.register = true
export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

function getGreeting() {
  let hour = new Date().getHours()
  if (hour < 3) return 'una linda noche 💤'
  if (hour < 6) return 'una linda mañana 🌅'
  if (hour < 12) return 'una linda mañana ✨'
  if (hour < 18) return 'una linda tarde 🌇'
  return 'una linda noche 🌙'
                                                                                              }
