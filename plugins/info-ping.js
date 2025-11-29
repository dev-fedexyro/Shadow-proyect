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

const FIXED_IMAGE_URL = 'https://files.catbox.moe/nmpcr8.jpg'

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

    let texto = `\`ⓘ ${latensi.toFixed(4)} ms\``

    const thumbnailBuffer = await getImageUrlBuffer()

    conn.sendMessage(
        m.chat,
        {
            text: texto,
            contextInfo: {
                externalAdReply: {
                    title: "𝘚𝘩𝘢𝘥𝘰𝘸 • 𝘗𝘪𝘯𝘨",
                    body: "Información del tiempo",
                    thumbnail: thumbnailBuffer,
                    mediaType: 1,
                    renderLargerThumbnail: false,
                    //sourceUrl: "https://wa.me/" + m.sender.split('@')[0]
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
