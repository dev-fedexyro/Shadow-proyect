/* Codigo creado por dev-fedexyz 
* github: https://github.com/dev-fedexyro
* no sabes créditos puta*/

let handler = async (m, { conn, command, args, text }) => {
    const isCommand1 = /^(inspect|inspeccionar)\b$/i.test(command)
    
    if (!isCommand1) return

    const channelUrl = text?.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:channel\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1]
    
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
        await m.reply(`${msm} Ocurrió un error.`)
        console.log(e)
    }

    let thumb = icons
    let pp
    
    const MetadataGroupInfo = async (res) => {
        const idHeader = res.isCommunity ? '*ID DE LA COMUNIDAD*' : '*ID DEL GRUPO*';
        const id = res.id || "No encontrado";
        return `${idHeader}\n*ID:* ${id}`;
    }

    const inviteGroupInfo = async (groupData) => {
        const idHeader = groupData.isCommunity ? '*ID DE LA COMUNIDAD*' : '*ID DEL GRUPO*';
        const id = groupData.id || "No encontrado";
        return `${idHeader}\n*ID:* ${id}`;
    }

    switch (true) {     
        case isCommand1:
            let inviteCode
            
            if (!text) return conn.reply(m.chat, '\`\`\`ⓘ Ingrese un enlace de grupo/comunidad o canal.\`\`\`', m)
            
            let info
            try {
                let res = text ? null : await conn.groupMetadata(m.chat)
                if (res) {
                    info = await MetadataGroupInfo(res)
                    console.log('Método de metadatos de grupo/comunidad')
                } else {
                    const inviteUrl = text?.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:invite\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1]
                    let inviteInfo
                    if (inviteUrl) {
                        try {
                            inviteInfo = await conn.groupGetInviteInfo(inviteUrl)
                            info = await inviteGroupInfo(inviteInfo)
                            console.log(`Método de enlace de grupo/comunidad.`)    
                        } catch (e) {
                             
                        }
                    }
                }
            } catch (e) {
                 
            }

            if (info) {
                
                await conn.sendMessage(m.chat, { text: info, contextInfo: {
                    mentionedJid: conn.parseMention(info),
                    externalAdReply: {
                        title: `Shadow - Inspector de IDS`,
                        body: `¡Super Inspectador!`,
                        thumbnailUrl: pp ? pp : thumb,
                        sourceUrl: args[0] ? args[0] : inviteCode ? `https://chat.whatsapp.com/${inviteCode}` : md,
                        mediaType: 1,
                        showAdAttribution: false,
                        renderLargerThumbnail: false
                    }
                }}, { quoted: fkontak })
            } else {
                
                let newsletterInfo
                if (!channelUrl) return conn.reply(m.chat, `*Verifique que sea un enlace válido de grupo, comunidad o canal de WhatsApp.*`, m)
                
                if (channelUrl) {
                    try {
                        newsletterInfo = await conn.newsletterMetadata("invite", channelUrl).catch(() => null)
                        if (!newsletterInfo) return conn.reply(m.chat, `No se encontró información del canal. Verifique que el enlace sea correcto.`, m)       
                        
                        
                        const channelID = newsletterInfo.id || 'ID no encontrado'
                        
                        const caption = `*ID DEL CANAL*\n*ID:* ${channelID}`
                        
                        
                        if (channelUrl && newsletterInfo) {
                            await conn.sendMessage(m.chat, { text: caption, contextInfo: {
                                mentionedJid: conn.parseMention(caption),
                                externalAdReply: {
                                    title: `Inspector de Canales`,
                                    body: `¡Super Inspectador!`,
                                    thumbnailUrl: pp,
                                    sourceUrl: args[0] || md,
                                    mediaType: 1,
                                    showAdAttribution: false,
                                    renderLargerThumbnail: false
                                }
                            }}, { quoted: fkontak })
                        }
                    } catch (e) {
                        reportError(e)
                    }
                }
            }
            break
    }
}

handler.tags = ['herramientas']
handler.help = ['inspect <enlace>', 'inspeccionar <enlace>']
handler.command = ['inspect', 'inspeccionar']

export default handler
