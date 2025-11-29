import { totalmem, freemem } from 'os'
import speed from 'performance-now'
import { sizeFormatter } from 'human-readable'
import fetch from 'node-fetch' 

const format = sizeFormatter({
    std: 'JEDEC',
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`
})

const FIXED_IMAGE_URL = 'https://files.catbox.moe/cdxpz2.jpg'

const getImageUrlBuffer = async () => {
    try {
        const response = await fetch(FIXED_IMAGE_URL)
        if (!response.ok) {
            console.error(`Error al descargar la imagen: ${response.statusText}`)
            return null
        }
        const arrayBuffer = await response.arrayBuffer()
        return Buffer.from(arrayBuffer)
    } catch (e) {
        console.error('Error de Fetch al obtener la imagen:', e)
        return null
    }
}

var handler = async (m, { conn }) => {
    let timestamp = speed()
    let latensi = speed() - timestamp

    let _muptime = process.uptime() * 1000
    let muptime = clockString(_muptime)

    let chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats)
    let groups = Object.entries(conn.chats)
        .filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats && !chat.metadata?.read_only && !chat.metadata?.announce)
        .map(v => v[0])

    let texto = `\`${latensi.toFixed(4)} ms\``

    const thumbnailBuffer = await getImageUrlBuffer()

    conn.sendMessage(
        m.chat,
        {
            text: texto,
            contextInfo: {
                externalAdReply: {
                    title: "Shadow • Ping",
                    body: "Información del tiempo",
                    thumbnail: thumbnailBuffer,
                    mediaType: 1,
                    renderLargerThumbnail: false,
                    sourceUrl: "https://wa.me/" + m.sender.split('@')[0]
                }
            }
        }
    )
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = ['ping', 'p']
handler.register = true

export default handler

function clockString(ms) {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}
