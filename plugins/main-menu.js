import { promises as fs } from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'

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
*─ׄ─ׅ─ׄ─⭒ 𝑩𝒊𝒆𝒏𝒗𝒆𝒏𝒊𝒅𝒐 %name ⭒─ׄ─ׅ─ׄ─*
“Hola %name, soy *_Shadow-Bot_*, %greeting”

╭── \`\`\`ꜱʜᴀᴅᴏᴡ ᴜʟᴛʀᴀ ᴍᴅ\`\`\`
│ 🌵 Modo: *Privado*
│ 📚 Baileys: *Multi Device*
│ ⏱ Tiempo Activo: *%uptime*
│ 👤 Usuarios: *%totalreg*
╰─────────────── %readmore

\`\`\`─ׄ─ׅ─ׄ─⭒ LISTA DE COMANDOS ⭒─ׄ─ׅ─ׄ─\`\`\`
`.trim(),
  header: `
╭── ⭒ *%category* `.trim(),
  body: '│ ➩ %cmd %islimit %isPremium',
  footer: '╰──────────\n',
  after: ''
}

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  try {
    const { exp, limit, level } = global.db.data.users[m.sender]
    const { min, xp, max } = xpRange(level, global.multiplier)
    const name = await conn.getName(m.sender)
    const _uptime = process.uptime() * 1000
    const uptime = clockString(_uptime)
    const totalreg = Object.keys(global.db.data.users).length
    const rtotalreg = Object.values(global.db.data.users).filter(user => user.registered).length

    let help = Object.values(global.plugins)
      .filter(plugin => !plugin.disabled)
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
        limit: plugin.limit,
        premium: plugin.premium,
        enabled: !plugin.disabled
      }))

    for (let plugin of help) {
      if (plugin && plugin.tags) {
        for (let tag of plugin.tags) {
          if (!(tag in tags)) tags[tag] = tag
        }
      }
    }

    const menuText = [
      defaultMenu.before,
      ...Object.keys(tags)
        .filter(tag => help.some(menu => menu.tags.includes(tag) && menu.help))
        .map(tag => {
          let section = help.filter(menu => menu.tags.includes(tag) && menu.help)
            .map(menu => menu.help.map(cmd =>
              defaultMenu.body
                .replace(/%cmd/g, menu.prefix ? cmd : _p + cmd)
                .replace(/%islimit/g, menu.limit ? '◜⭐◞' : '')
                .replace(/%isPremium/g, menu.premium ? '◜🪪◞' : '')
            ).join('\n')).join('\n')

          return section.trim() ? defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + section + '\n' + defaultMenu.footer : ''
        }),
      defaultMenu.after
    ].join('\n')

    const greeting = getGreeting()
    const replace = {
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

    const text = menuText.replace(new RegExp(`%(${Object.keys(replace).join('|')})`, 'g'), (_, key) => replace[key])

    const buttonMessage = {
      video: { url: 'https://cdn.russellxz.click/14cf14e9.mp4'},
      gifPlayback: true,
      caption: text.trim(),
      mentions: [m.sender],
      footer: '*_🌵 usa el botón de abajo para ser Sub-Bot._*',
      buttons: [
        { buttonId: '.code', buttonText: { displayText: 'ꜱᴇʀ ꜱᴜʙ-ʙᴏᴛ'}, type: 1}
      ],
      headerType: 4,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          renderLargerThumbnail: true, 
          title: 'Shadow menu', 
          body: 'Shadow Ultra MD', 
          thumbnailUrl: 'https://files.catbox.moe/12zb63.jpg', 
          sourceUrl: ''
        }
      }
    }

    await m.react('🌑')
    await conn.sendMessage(m.chat, buttonMessage, { quoted: m })

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
