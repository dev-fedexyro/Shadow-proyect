import fetch from 'node-fetch'

const handler = async (m, { conn, command, args, usedPrefix }) => {
    let url = args[0]
    
    if (!url) {
        return conn.reply(m.chat, `*✨ Por favor, ingrese el link de una página web para tomarle captura.*`, m)
    }

    if (!url.includes('.') || url.length < 5) {
        return conn.reply(m.chat, `🔗 El enlace proporcionado parece inválido. Asegúrese de incluir el dominio (ej: google.com).`, m)
    }
    
    if (!/^(https?:\/\/)/i.test(url)) {
        url = 'http://' + url
    }

    try {
        await m.react('⏳')

        const apiUrl = `https://image.thum.io/get/fullpage/${url}`
        let response = await fetch(apiUrl)
        
        if (!response.ok) {
            throw new Error(`Fallo al obtener la captura. Código de estado: ${response.status}`)
        }

        let ss = await response.buffer()

        const caption = `*乂 C A P T U R A - W E B 乂*\n\n*» URL:* ${url}`
        await conn.sendFile(m.chat, ss, 'screenshot.png', caption, fkontak)
        
        await m.react('✅')

    } catch (error) {
        await m.react('❌')
        return conn.reply(m.chat, `⚠︎ **Error al tomar la captura.**\n\n> Detalles: ${error.message}\n> Usa *${usedPrefix}report* para informar si persiste.`, m)
    }
}

handler.help = ['ssweb', 'ss']
handler.tags = ['herramientas']
handler.command = ['ssweb', 'ss']
handler.group = true

export default handler
