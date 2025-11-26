/* Codigo creado por dev-fedexyz X fede Uchiha 
* github: https://github.com/dev-fedexyro
* no saques créditos puta*/

let handler = async (m, { conn, command, args, text }) => {
    const isChannelLinkCommand = /^(chanelink|clink)\b$/i.test(command);
    
    if (!isChannelLinkCommand) return

    let msm = 'Ocurrió un error.'
    let icons = 'https://files.catbox.moe/p0fk5h.jpg'
    let md = 'https://github.com/dev-fedexyzz'

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

    async function reportError(e) {
        await m.reply(`*${msm}* Ocurrió un error al intentar obtener el enlace.`)
        console.log(e)
    }

    let thumb = icons
    let pp = thumb
    
    if (!text) return conn.reply(m.chat, `\`\`\`ⓘ Por favor, ingresa el ID del canal. \n\nEjemplo: ${command} 1234567890@newsletter\`\`\``, m)
    
    const channelId = text.trim();
    
    if (!channelId.endsWith('@newsletter')) {
         return conn.reply(m.chat, `\`\`\`❌ Error: El formato del ID del canal debe ser completo. \n\nDebe terminar en @newsletter. Ejemplo: ${command} 1234567890@newsletter\`\`\``, m)
    }

    try {
        const inviteInfo = await conn.newsletterGetInvite(channelId);
        
        if (!inviteInfo || !inviteInfo.url) {
            return conn.reply(m.chat, '*❌ No se pudo obtener el enlace de invitación. El servidor no devolvió un enlace válido, incluso si el ID parece correcto.*', m);
        }

        const channelLink = inviteInfo.url;
        
        const caption = `*🔗 ENLACE DE INVITACIÓN DEL CANAL*\n\n*ID:* ${channelId}\n*Enlace:* ${channelLink}`;
        
        await conn.sendMessage(m.chat, { text: caption, contextInfo: {
            mentionedJid: conn.parseMention(caption),
            externalAdReply: {
                title: `Shadow - Enlace de Canal`,
                body: `Enlace obtenido por ID`,
                thumbnailUrl: pp,
                sourceUrl: channelLink,
                mediaType: 1,
                showAdAttribution: false,
                renderLargerThumbnail: false
            }
        }}, { quoted: fkontak });

    } catch (e) {
        if (e.output && e.output.statusCode === 404) {
             return conn.reply(m.chat, '*❌ Error 404: El canal con ese ID no fue encontrado. El ID es incorrecto o el canal fue eliminado.*', m);
        } else if (e.message && e.message.includes('not a newsletter')) {
             return conn.reply(m.chat, '*❌ Error: El ID proporcionado no corresponde a un canal (newsletter) válido.*', m);
        }
        
        await reportError(e);
        await conn.reply(m.chat, `*❌ Fallo en la API.* Intenta con otro ID para confirmar el error. El ID: *${channelId}* podría ser inválido.`, m);
    }
}

handler.tags = ['herramientas']
handler.help = ['chanelink <ID>', 'clink <ID>']
handler.command = ['chanelink', 'clink']

export default handler
