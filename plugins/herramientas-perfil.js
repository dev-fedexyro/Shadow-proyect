import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'
import fetch from 'node-fetch'

async function formatTime(ms) {
    let s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24)
    let months = Math.floor(d / 30), weeks = Math.floor((d % 30) / 7)
    s %= 60; m %= 60; h %= 24; d %= 7
    let t = months ? [`${months} mes${months > 1 ? 'es' : ''}`] :
        weeks ? [`${weeks} semana${weeks > 1 ? 's' : ''}`] :
        d ? [`${d} día${d > 1 ? 's' : ''}`] : []
    if (h) t.push(`${h} hora${h > 1 ? 's' : ''}`)
    if (m) t.push(`${m} minuto${m > 1 ? 's' : ''}`)
    if (s) t.push(`${s} segundo${s > 1 ? 's' : ''}`)
    return t.length > 1 ? t.slice(0, -1).join(' ') + ' y ' + t.slice(-1) : t[0] || '1 segundo'
}

const regHandler = async (m, { conn, args, usedPrefix }) => {
    let userId = m.sender
    
    if (!global.db.data.users[userId]) global.db.data.users[userId] = {}
    let user = global.db.data.users[userId]
    
    if (user.registered) {
        return m.reply('❌ ¡Ya estás registrado! Usa *#unreg* si deseas cambiar tu información.', m)
    }

    if (args.length < 1) {
        return m.reply(`*⚠️ Formato Incorrecto:*\n\nDebe ser: ${usedPrefix}reg <nombre>|<año>.<edad>\n*Ejemplo:* ${usedPrefix}reg fede|2007.17`, m)
    }

    let parts = args.join(' ').split('|')
    if (parts.length < 2) {
        return m.reply(`*Falta la edad/año.* Usa el formato: ${usedPrefix}reg nombre|año.edad\n\n*Ejemplo:* ${usedPrefix}reg fede|2007.17`, m)
    }

    let name = parts[0].trim()
    let ageParts = parts[1].split('.')
    let year = parseInt(ageParts[0])
    let age = parseInt(ageParts[1])

    if (!name || name.length < 3) {
        return m.reply('El nombre de registro debe tener al menos 3 caracteres.', m)
    }
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() || isNaN(age) || age < 10 || age > 100) {
        return m.reply('El año o la edad ingresados no son válidos. Verifica los números.', m)
    }

    const registrationTime = Date.now()
    
    user.name_reg = name
    user.age_reg = age
    user.birth = `${year}` 
    user.registered = registrationTime
    
    m.reply(`✅ *¡Registro Completo!*
Ahora puedes ver tu perfil usando *${usedPrefix}perfil*.

*Datos guardados:*
*Nombre:* ${name}
*Edad:* ${age} años
*Registrado en:* ${moment(registrationTime).tz('America/Argentina/Buenos_Aires').format('DD/MM/YYYY HH:mm:ss')}`, m)
}

let handler = async (m, { conn, args, usedPrefix }) => {
    if (['reg', 'register', 'registrar'].includes(m.text.toLowerCase().split(' ')[0].replace(usedPrefix, ''))) {
        return regHandler(m, { conn, args, usedPrefix });
    }

    try {
        let userId = m.mentionedJid.length > 0 ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender)
        
        if (!global.db.data.users[userId]) global.db.data.users[userId] = {}
        const user = global.db.data.users[userId]

        if (!user.registered) {
            return m.reply(`⚠️ *¡Necesitas registrarte primero!*
Usa el comando *${usedPrefix}reg* con el formato:

*${usedPrefix}reg nombre|año.edad*
*Ejemplo:* ${usedPrefix}reg fede|2007.17`, m)
        }

        const name = await (async () => user.name || (await conn.getName(userId)))()
        
        const { min, xp } = xpRange(user.level || 0, global.multiplier)
        const rank = Object.entries(global.db.data.users).map(([k, v]) => ({ ...v, jid: k })).sort((a, b) => (b.level || 0) - (a.level || 0)).findIndex(u => u.jid === userId) + 1
        
        const registered = user.registered || 0
        const registeredDate = moment(registered).tz('America/Argentina/Buenos_Aires').format('DD/MM/YYYY HH:mm:ss')
        const totalCoins = (user.coin || 0) + (user.bank || 0)
        const botContacts = conn.contacts ? conn.contacts.length.toLocaleString() : 'N/A' 
        
        const ownedIDs = Object.entries(global.db.data.characters).filter(([, c]) => c.user === userId).map(([id]) => id)
        const haremCount = ownedIDs.length
        const favChar = user.favorite && global.db.data.characters?.[user.favorite] ? global.db.data.characters[user.favorite].name : 'Ninguno'

        const text = `
╭┈ 『👤』 *TARJETA DE PERFIL*
│ • *Usuario:* ${name}
│ • *Descripción:* ${user.description || 'Sin descripción...'}
│ • *Pareja:* ${user.marry ? (global.db.data.users[user.marry]?.name || 'Usuario') : 'Nadie'}
╰═───────┈
╭┈ 『📊』 *ESTADÍSTICAS*
│ ❖ *Nivel:* ${user.level || 0} (#${rank})
│ ⦾ *Progreso:* ${user.exp - min}/${xp} (${Math.floor(((user.exp - min) / xp) * 100)}%)
│ ☆ *Experiencia:* ${user.exp?.toLocaleString() || 0}
│ ⛁ *Coins Totales:* ${totalCoins.toLocaleString()} ${currency}
│ ❒ *Comandos Usados:* ${user.commands || 0}
╰═───────┈
╭┈ 『📜』 *DATOS ADICIONALES*
│ 🎂 *Cumpleaños:* ${user.birth || 'Sin especificar'}
│ 📜 *Nombre REG:* ${user.name_reg || 'N/A'}
│ ⏰ *Hora REG:* ${registeredDate}
│ 📈 *LID (Contactos Bot):* ${botContacts}
│ 💘 *Harem/Waifus:* ${haremCount} (${favChar})
╰═───────┈`

        const pp = await conn.profilePictureUrl(userId, 'image').catch(_ => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')
        
        await conn.sendMessage(m.chat, { image: { url: pp }, caption: text.trim(), mentions: [userId] }, { quoted: m })

    } catch (error) {
        console.error(error)
        await m.reply(`⚠︎ Se ha producido un problema al generar el perfil.\n> Error: ${error.message}`, m)
    }
}

handler.help = ['profile', 'reg']
handler.tags = ['info']
handler.command = ['profile', 'perfil', 'perfíl', 'reg', 'register', 'registrar']
handler.group = true

export default handler
