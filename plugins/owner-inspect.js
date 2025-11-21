import { getUrlFromDirectPath, generateWAMessageFromContent } from "@whiskeysockets/baileys"
import _ from "lodash"
import axios from 'axios'
import { Buffer } from 'buffer'

async function sendCustomPedido(m, conn, texto) {
  try {
    const img = 'https://files.catbox.moe/p0fk5h.jpg'
    const res = await axios.get(img, { responseType: 'arraybuffer' })
    const imgBuffer = Buffer.from(res.data)

    const orderMessage = {
      orderId: 'FAKE-' + Date.now(),
      thumbnail: imgBuffer,
      itemCount: 1,
      status: 1,
      surface: 1,
      message: texto,
      orderTitle: 'Shadow - inspect',
      token: null,
      sellerJid: null,
      totalAmount1000: '0',
      totalCurrencyCode: 'GTQ',
      contextInfo: {
        externalAdReply: {
          title: botname,
          body: '',
          thumbnailUrl: img,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }

    const msg = generateWAMessageFromContent(m.chat, { orderMessage }, { quoted: m })
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  } catch (err) {
    console.error(err)
    m.reply('⚠️ Error enviando el pedido.', m)
  }
}

let handler = async (m, { conn, command, usedPrefix, args, text, groupMetadata, isOwner, isROwner }) => {
    const isCommand1 = /^(inspect|inspeccionar)\b$/i.test(command)
    
    if (!isCommand1) return

    const channelUrl = text?.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:channel\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1]
    
    let msm = 'Ocurrió un error.'
    let icons = 'https://files.catbox.moe/p0fk5h.jpg'
    let md = 'https://github.com/dev-fedexyzz'
    let botname = 'Inspector Bot'

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
    
    const MetadataGroupInfo = async (res, isInviteInfo = false) => {
        let nameCommunity = "no pertenece a ninguna Comunidad"
        let groupPicture = "No se pudo obtener"
        let inviteCode 

        if (res.linkedParent) {
            let linkedGroupMeta = await conn.groupMetadata(res.linkedParent).catch(e => { return null })
            nameCommunity = linkedGroupMeta ? "\n" + ("`Nombre:` " + linkedGroupMeta.subject || "") : nameCommunity
        }
        pp = await conn.profilePictureUrl(res.id, 'image').catch(e => { return null })
        
        if (!text) {
             inviteCode = await conn.groupInviteCode(m.chat).catch(e => { return null })
        }
        
        const formatParticipants = (participants) =>
            participants && participants.length > 0
                ? participants.map((user, i) => `${i + 1}. @${user.id?.split("@")[0]}${user.admin === "superadmin" ? " (superadmin)" : user.admin === "admin" ? " (admin)" : ""}`).join("\n")
                : "No encontrado"
        
        let caption = `🆔 *Identificador del grupo:*\n${res.id || "No encontrado"}\n\n` +
            `👑 *Creado por:*\n${res.owner ? `@${res.owner?.split("@")[0]}` : "No encontrado"} ${res.creation ? `el ${formatDate(res.creation)}` : "(Fecha no encontrada)"}\n\n` +
            `🏷️ *Nombre:*\n${res.subject || "No encontrado"}\n\n` +
            `✏️ *Nombre cambiado por:*\n${res.subjectOwner ? `@${res.subjectOwner?.split("@")[0]}` : "No encontrado"} ${res.subjectTime ? `el ${formatDate(res.subjectTime)}` : "(Fecha no encontrada)"}\n\n` +
            `📄 *Descripción:*\n${res.desc || "No encontrado"}\n\n` +
            `📝 *Descripción cambiado por:*\n${res.descOwner ? `@${res.descOwner?.split("@")[0]}` : "No encontrado"}\n\n` +
            `🗃️ *Id de la descripción:*\n${res.descId || "No encontrado"}\n\n` +
            `🖼️ *Imagen del grupo:*\n${pp ? pp : groupPicture}\n\n` +
            `💫 *Autor:*\n${res.author || "No encontrado"}\n\n` +
            `🎫 *Código de invitación:*\n${res.inviteCode || inviteCode || "No disponible"}\n\n` +
            `⌛ *Duración:*\n${res.ephemeralDuration !== undefined ? `${res.ephemeralDuration} segundos` : "Desconocido"}\n\n` +
            `🛃 *Admins:*\n` + (res.participants && res.participants.length > 0 ? res.participants.filter(user => user.admin === "admin" || user.admin === "superadmin").map((user, i) => `${i + 1}. @${user.id?.split("@")[0]}${user.admin === "superadmin" ? " (superadmin)" : " (admin)"}`).join("\n") : "No encontrado") + `\n\n` +
            `🔰 *Usuarios en total:*\n${res.size || "Cantidad no encontrada"}\n\n` +
            `✨ *Información avanzada* ✨\n\n🔎 *Comunidad vinculada al grupo:*\n${res.isCommunity ? "Este grupo es un chat de avisos" : `${res.linkedParent ? "`Id:` " + res.linkedParent : "Este grupo"} ${nameCommunity}`}\n\n` +
            `⚠️ *Restricciones:* ${res.restrict ? "✅" : "❌"}\n` +
            `📢 *Anuncios:* ${res.announce ? "✅" : "❌"}\n` +
            `🏘️ *¿Es comunidad?:* ${res.isCommunity ? "✅" : "❌"}\n` +
            `📯 *¿Es anuncio de comunidad?:* ${res.isCommunityAnnounce ? "✅" : "❌"}\n` +
            `🤝 *Tiene aprobación de miembros:* ${res.joinApprovalMode ? "✅" : "❌"}\n` +
            `🆕 *Puede Agregar futuros miembros:* ${res.memberAddMode ? "✅" : "❌"}\n\n` 
        return caption.trim()
    }

    const inviteGroupInfo = async (groupData) => {
        const { id, subject, subjectOwner, subjectTime, size, creation, owner, desc, descId, linkedParent, restrict, announce, isCommunity, isCommunityAnnounce, joinApprovalMode, memberAddMode, ephemeralDuration } = groupData
        let nameCommunity = "no pertenece a ninguna Comunidad"
        let groupPicture = "No se pudo obtener"
        if (linkedParent) {
            let linkedGroupMeta = await conn.groupMetadata(linkedParent).catch(e => { return null })
            nameCommunity = linkedGroupMeta ? "\n" + ("`Nombre:` " + linkedGroupMeta.subject || "") : nameCommunity
        }
        pp = await conn.profilePictureUrl(id, 'image').catch(e => { return null })
        const formatParticipants = (participants) =>
            participants && participants.length > 0
                ? participants.map((user, i) => `${i + 1}. @${user.id?.split("@")[0]}${user.admin === "superadmin" ? " (superadmin)" : user.admin === "admin" ? " (admin)" : ""}`).join("\n")
                : "No encontrado"

        let caption = `🆔 *Identificador del grupo:*\n${id || "No encontrado"}\n\n` +
            `👑 *Creado por:*\n${owner ? `@${owner?.split("@")[0]}` : "No encontrado"} ${creation ? `el ${formatDate(creation)}` : "(Fecha no encontrada)"}\n\n` +
            `🏷️ *Nombre:*\n${subject || "No encontrado"}\n\n` +
            `✏️ *Nombre cambiado por:*\n${subjectOwner ? `@${subjectOwner?.split("@")[0]}` : "No encontrado"} ${subjectTime ? `el ${formatDate(subjectTime)}` : "(Fecha no encontrada)"}\n\n` +
            `📄 *Descripción:*\n${desc || "No encontrada"}\n\n` +
            `💠 *ID de la descripción:*\n${descId || "No encontrado"}\n\n` +
            `🖼️ *Imagen del grupo:*\n${pp ? pp : groupPicture}\n\n` +
            `🏆 *Miembros destacados:*\n${formatParticipants(groupData.participants)}\n\n` +
            `👥 *Destacados total:*\n${size || "Cantidad no encontrada"}\n\n` +
            `✨ *Información avanzada* ✨\n\n🔎 *Comunidad vinculada al grupo:*\n${isCommunity ? "Este grupo es un chat de avisos" : `${linkedParent ? "`Id:` " + linkedParent : "Este grupo"} ${nameCommunity}`}\n\n` +
            `📢 *Anuncios:* ${announce ? "✅ Si" : "❌ No"}\n` +
            `🏘️ *¿Es comunidad?:* ${isCommunity ? "✅ Si" : "❌ No"}\n` +
            `📯 *¿Es anuncio de comunidad?:* ${isCommunityAnnounce ? "✅" : "❌"}\n` +
            `🤝 *Tiene aprobación de miembros:* ${joinApprovalMode ? "✅" : "❌"}\n`
        return caption.trim()
    }

    switch (true) {     
        case isCommand1:
            let inviteCode
            if (!text) return sendCustomPedido(m, conn, '*ⓘ* `Ingrese un enlace de grupo/comunidad o canal.`')
            
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
                        title: `Inspector de Grupos`,
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
                        newsletterInfo = await conn.newsletterMetadata("invite", channelUrl).catch(e => { return null })
                        if (!newsletterInfo) return conn.reply(m.chat, `No se encontró información del canal. Verifique que el enlace sea correcto.`, m)       
                        
                        
                        const channelID = newsletterInfo.id || 'ID no encontrado'
                        
                        let caption = `*ID DEL CANAL:*\n` +
                                      `*ID:* ${channelID}\n\n`
                                      
                        
                        if (newsletterInfo?.preview) {
                            pp = getUrlFromDirectPath(newsletterInfo.preview)
                        } else {
                            pp = thumb
                        }
                        
                        
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

handler.tags = ['tools']
handler.help = ['inspect <enlace>', 'inspeccionar <enlace>']
handler.command = ['inspect', 'inspeccionar']
handler.register = true
export default handler 

function formatDate(n, locale = "es", includeTime = true) {
    if (n > 1e12) {
        n = Math.floor(n / 1000)
    } else if (n < 1e10) {
        n = Math.floor(n * 1000)
    }
    const date = new Date(n)
    if (isNaN(date)) return "Fecha no válida"
    const optionsDate = { day: '2-digit', month: '2-digit', year: 'numeric' }
    const formattedDate = date.toLocaleDateString(locale, optionsDate)
    if (!includeTime) return formattedDate
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    const period = hours < 12 ? 'AM' : 'PM'
    const formattedTime = `${hours}:${minutes}:${seconds} ${period}`
    return `${formattedDate}, ${formattedTime}`
}

function formatValue(key, value, preview) {
    switch (key) {
        case "subscribers":
            return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "No hay suscriptores"
        case "creation_time":
        case "nameTime":
        case "descriptionTime":
            return formatDate(value)
        case "description": 
        case "name":
            return value || "No hay información disponible"
        case "state":
            switch (value) {
                case "ACTIVE": return "Activo"
                case "GEOSUSPENDED": return "Suspendido por región"
                case "SUSPENDED": return "Suspendido"
                default: return "Desconocido"
            }
        case "reaction_codes":
            switch (value) {
                case "ALL": return "Todas las reacciones permitidas"
                case "BASIC": return "Reacciones básicas permitidas"
                case "NONE": return "No se permiten reacciones"
                default: return "Desconocido"
            }
        case "verification":
            switch (value) {
                case "VERIFIED": return "Verificado"
                case "UNVERIFIED": return "No verificado"
                default: return "Desconocido"
            }
        case "mute":
            switch (value) {
                case "ON": return "Silenciado"
                case "OFF": return "No silenciado"
                case "UNDEFINED": return "Sin definir"
                default: return "Desconocido"
            }
        case "view_role":
            switch (value) {
                case "ADMIN": return "Administrador"
                case "OWNER": return "Propietario"
                case "SUBSCRIBER": return "Suscriptor"
                case "GUEST": return "Invitado"
                default: return "Desconocido"
            }
        case "picture":
            if (preview) {
                return getUrlFromDirectPath(preview)
            } else {
                return "No hay imagen disponible"
            }
        default:
            return value !== null && value !== undefined ? value.toString() : "No hay información disponible"
    }
}

function newsletterKey(key) {
    return _.startCase(key.replace(/_/g, " "))
        .replace("Id", "🆔 Identificador")
        .replace("State", "📌 Estado")
        .replace("Creation Time", "📅 Fecha de creación")
        .replace("Name Time", "✏️ Fecha de modificación del nombre")
        .replace("Name", "🏷️ Nombre")
        .replace("Description Time", "📝 Fecha de modificación de la descripción")
        .replace("Description", "📜 Descripción")
        .replace("Invite", "📩 Invitación")
        .replace("Handle", "👤 Alias")
        .replace("Picture", "🖼️ Imagen")
        .replace("Preview", "👀 Vista previa")
        .replace("Reaction Codes", "😃 Reacciones")
        .replace("Subscribers", "👥 Suscriptores")
        .replace("Verification", "✅ Verificación")
        .replace("Viewer Metadata", "🔍 Datos avanzados")
}

function processObject(obj, prefix = "", preview, handle = null) {
    let caption = ""
    Object.keys(obj).forEach(key => {
        const value = obj[key]
        if (typeof value === "object" && value !== null) {
            if (Object.keys(value).length > 0) {
                const sectionName = newsletterKey(prefix + key)
                caption += `\n*\`${sectionName}\`*\n`
                caption += processObject(value, `${prefix}${key}_`, preview, handle)
            }
        } else {
            const shortKey = prefix ? prefix.split("_").pop() + "_" + key : key
            const displayValue = formatValue(shortKey, value, preview)
            const translatedKey = newsletterKey(shortKey)
            
            caption += `- *${translatedKey}:*\n${displayValue}\n\n`
            
            if (shortKey === "id") {
                const aliasValue = handle || "No disponible"
                const aliasKey = newsletterKey("alias_newsletter") 
                caption += `- *${aliasKey}:*\n${aliasValue}\n\n`
            }
        }
    })
    return caption.trim()
      }
