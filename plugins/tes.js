import { promises as fs} from 'fs'
import { join} from 'path'
import { xpRange} from '../lib/levelling.js'

const defaultMenu = { 
  before: `
───────── ⭒ ─────────

Hola %name, soy *Shadow-Bot*.
%greeting, estoy aquí para ayudarte.

🌵 Modo: *Privado*
📚 Motor: *Baileys MD*
⏱ Tiempo activo: *%uptime*
👥 Usuarios registrados: *%totalreg*%readmore
`.trim() 
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

    let text = defaultMenu.before.replace(new RegExp(`%(${Object.keys(replace).join('|')})`, 'g'), (_, key) => replace[key])
    

    let sections = [{ 
        title: "SHADOW ASSISTENT ☃️", 
        rows: [ 
            { title: "Info Owner", id: ".owner" }, 
            { title: "Info Bot", id: ".infobot" }, 
            { title: "Menu All", id: ".allmenu" }, 
            { title: "Auto Reg", id: ".reg user.19" }, 
            { title: "Ping", id: ".ping" }, 
            { title: "Status", id: ".status" } 
        ] 
    }];

    let listMessage = { 
      text: text.trim(), 
      title: "✨ *MENÚ PRINCIPAL DE SHADOW-BOT*", 
      buttonText: "𝚂𝚎𝚕𝚎𝚌𝚝 𝙼𝚎𝚗𝚞", 
      footer: "*_© SHADOW SEISHIRO ASSISTENT ☃️_*", 
      sections: sections, 
      mentions: [m.sender] 
    }

    await m.react('🌑')
    
    await conn.sendMessage(m.chat, listMessage, { quoted: m })

} catch (e) {
    await m.react('✖️')
    console.error(e) 
    await conn.reply(m.chat, `¡Ups! Ocurrió un error. No pude enviar el menú. Por favor, revisa la consola para más detalles.`, m)
}
}

handler.help = ['menutest']
handler.tags = ['main']
handler.command = ['menutest']
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
