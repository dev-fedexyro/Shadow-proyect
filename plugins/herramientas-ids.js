let handler = async (m, { conn, command, args, text }) => {
    const isCommandId = /^(id)$/i.test(command)
    
    if (!isCommandId) return

    let fkontak = { 
        "key": { 
            "participants":"0@s.whatsapp.net", 
            "remoteJid": "status@broadcast", 
            "fromMe": false, 
            "id": "Halo" 
        }, 
        "message": { 
            "contactMessage": { 
                "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
            }
        }, 
        "participant": "0@s.whatsapp.net" 
    }

    let icons = 'https://files.catbox.moe/p0fk5h.jpg' 
    let md = 'https://github.com/dev-fedexyzz'

    if (!text) {
        return conn.reply(m.chat, '\`\`\`ⓘ Por favor, ingresa el ID/JID de un canal, grupo/comunidad para generar su URL.\`\`\`', m)
    }

    let result = ''
    let title = 'Generador de URL'
    let pp = icons
    
    let targetJid = text.trim()
    
    const isChannelJid = targetJid.includes('@newsletter')
    const isGroupJid = targetJid.includes('@g.us')

    if (!isChannelJid && !isGroupJid && targetJid.length >= 15 && !isNaN(targetJid)) {
        targetJid = `${targetJid}@newsletter`
        title = 'Generador de URL de Canal'
    } else if (!isChannelJid && !isGroupJid) {
         return conn.reply(m.chat, `⚠️ El ID debe ser un JID completo (ej: \`1234567890@newsletter\` para canal o \`1234567890@g.us\` para grupo).`, m)
    }

    if (targetJid.includes('@newsletter')) {
        title = 'Generador de URL de Canal'
        try {
            const inviteCodeResult = await conn.getNewsletterInviteCode(targetJid)
            
            const inviteCode = inviteCodeResult && inviteCodeResult.code ? inviteCodeResult.code : null
            
            if (inviteCode) {
                const channelUrl = `https://whatsapp.com/channel/${inviteCode}`
                result = `*✅ URL DE CANAL GENERADA*\n\n*ID:* \`${targetJid}\`\n*URL:* ${channelUrl}`
                pp = await conn.profilePictureUrl(targetJid, 'image').catch(() => icons)
            } else {
                result = `❌ No se pudo obtener el código de invitación para el ID de Canal: ${targetJid}.\n\n*Posiblemente:* ID incorrecto o Bot no autorizado.`
            }
        } catch (e) {
            result = `❌ Error al generar URL de Canal.\n*Mensaje de Error:* ${e.message}`
            console.error("Error al obtener URL del canal:", e)
        }

    } else if (targetJid.includes('@g.us')) {
        title = 'Generador de URL de Grupo/Comunidad'
        try {
            const inviteCode = await conn.groupInviteCode(targetJid)
            if (inviteCode) {
                const groupUrl = `https://chat.whatsapp.com/${inviteCode}`
                result = `*✅ URL DE GRUPO/COMUNIDAD GENERADA*\n\n*ID:* \`${targetJid}\`\n*URL:* ${groupUrl}`
                pp = await conn.profilePictureUrl(targetJid, 'image').catch(() => icons)
            } else {
                result = `❌ No se pudo obtener el código de invitación para el ID: ${targetJid}.\n\n*Posiblemente:* El bot NO es administrador del grupo/anuncios.`
            }
        } catch (e) {
            result = `❌ Error al generar URL de Grupo/Comunidad.\n*Mensaje de Error:* ${e.message}`
            console.error("Error al obtener URL del grupo/comunidad:", e)
        }
    } else {
        result = '❌ ID/JID no reconocido. No se pudo determinar si es Canal o Grupo/Comunidad.'
    }
    
    await conn.sendMessage(m.chat, { 
        text: result, 
        contextInfo: {
            mentionedJid: conn.parseMention(result),
            externalAdReply: {
                title: title,
                body: `Resultado de la conversión ID -> URL.`,
                thumbnailUrl: pp,
                sourceUrl: md,
                mediaType: 1,
                showAdAttribution: false,
                renderLargerThumbnail: false
            }
        }
    }, { quoted: fkontak })
}

handler.tags = ['herramientas']
handler.help = ['id <JID>']
handler.command = ['id']

export default handler
