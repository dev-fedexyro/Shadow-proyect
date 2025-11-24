import { createHash } from 'crypto'
import fetch from 'node-fetch'
import uploadFile from '../lib/uploadFile.js'
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"
import crypto from "crypto"

async function catbox(content) {
    const { ext, mime } = (await fileTypeFromBuffer(content)) || {}
    const blob = new Blob([content.toArrayBuffer()], { type: mime })
    const formData = new FormData()
    const randomBytes = crypto.randomBytes(5).toString("hex")
    
    formData.append("reqtype", "fileupload")
    formData.append("fileToUpload", blob, randomBytes + "." + ext)
    
    const response = await fetch("https://catbox.moe/user/api.php", { 
        method: "POST", 
        body: formData, 
        headers: { 
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36" 
        }
    })

    if (!response.ok) {
        throw new Error(`Catbox API error: ${response.statusText}`)
    }
    
    return await response.text()
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}

const handler = async (m, { conn, command, usedPrefix, text }) => {
    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''

        if (!mime || !/image|video/.test(mime)) {
            return conn.reply(m.chat, `⭐ Por favor, responde a una **Imagen** o **Vídeo** para usar *${usedPrefix + command}*.`, m)
        }

        await m.react('⏳')
        
        const media = await q.download()
        
        let link = ''
        let title = ''
        
        switch (command) {
            case 'tourl': {
                link = await uploadFile(media) 
                title = 'L I N K - E N L A C E'
                break
            }
            case 'catbox': {
                link = await catbox(media)
                title = 'C A T B O X - U P L O A D E R'
                break
            }
        }

        const isTele = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime)
        const txt = `*乂 ${title} 乂*\n\n*» Enlace* : ${link}\n*» Tamaño* : ${formatBytes(media.length)}\n*» Expiración* : ${isTele ? 'No expira' : 'Desconocido'}\n\n> *${dev}*`
        
        await conn.sendFile(m.chat, media, 'thumbnail.jpg', txt, fkontak) 
        await m.react('✅')

    } catch (error) {
        await m.react('❌')
        const errorMessage = (error.message && error.message.includes('API')) 
            ? `⚠️ **Error en la subida a ${command.toUpperCase()}!**`
            : `⚠︎ **Error Crítico.** Problema inesperado (descarga/proceso).`
            
        await conn.reply(m.chat, `${errorMessage}\n\n_Detalles_: ${error.message}`, m)
    }
}

handler.help = ['tourl', 'catbox']
handler.tags = ['herramientas']
handler.command = ['tourl', 'catbox']

export default handler
