import yts from "yt-search"
import fetch from "node-fetch"

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`🌱 Promociona un nombre o enlace de YouTube...`)

  await m.react("🔎")

  try {
    let url = text
    let title = "Desconocido"
    let authorName = "Desconocido"
    let durationTimestamp = "Desconocida"
    let views = "Desconocidas"
    let thumbnail = ""

    if (!text.startsWith("https://")) {
      const res = await yts(text)
      if (!res || !res.videos || res.videos.length === 0) {
        return m.reply(`*— Resultado de Búsqueda —*

No se encontraron videos para tu búsqueda. Intenta con un término más preciso.`)
      }

      const video = res.videos[0]
      title = video.title || title
      authorName = video.author?.name || authorName
      durationTimestamp = video.timestamp || durationTimestamp
      views = video.views || views
      url = video.url || url
      thumbnail = video.thumbnail || ""
    }

    const isAudio = ["play", "playaudio", "ytmp3"].includes(command)
    const isVideo = ["play2", "playvid", "ytv", "ytmp4"].includes(command)

    if (isAudio) {
      await downloadMedia(conn, m, url, title, thumbnail, "mp3") 
    } else if (isVideo) {
      await downloadMedia(conn, m, url, title, thumbnail, "mp4")
    } else {
      await m.reply(`*— Información del Contenido —*

*Título:* ${title}
*Canal:* ${authorName}
*Duración:* ${durationTimestamp}
*Vistas:* ${views}
*URL:* ${url}

*Comandos de Descarga:*
• .ytmp3 ${url}
• .ytmp4 ${url}`)
    }

  } catch (error) {
    console.error("Error general:", error)
    await m.reply(`${error.message}`)
    await m.react("⚠️")
  }
}

const downloadMedia = async (conn, m, url, title, thumbnail, type) => {
  try {
    const cleanTitle = cleanName(title) + (type === "mp3" ? ".mp3" : ".mp4")

    const msg = `*— Descarga en Proceso —*

*Título:* ${title}
*Tipo:* ${type === "mp3" ? "Audio (MP3)" : "Video (MP4)"}
Espere un momento, se está procesando el archivo...`

    if (thumbnail) {
      await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: msg }, { quoted: m })
    } else {
      await m.reply(msg)
    }

    const apiUrl = `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(url)}&type=${type}&apikey=may-de618680`
    const response = await fetch(apiUrl)
    const data = await response.json()

    if (!data || !data.status || !data.result || !data.result.url) {
      throw new Error("🌵 No se pudo obtener el archivo de descarga...")
    }

    if (type === "mp3") {
      await conn.sendMessage(m.chat, {
        audio: { url: data.result.url },
        mimetype: "audio/mpeg",
        fileName: cleanTitle,
        contextInfo: {
          externalAdReply: {
            title: "Shadow descarga",
            body: "Shadow bot",
            thumbnailUrl: thumbnail,
            sourceUrl: url,
            mediaType: 2,
            mediaUrl: url
          }
        }
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        video: { url: data.result.url },
        mimetype: "video/mp4",
        fileName: cleanTitle
      }, { quoted: m })
    }

    await m.react("✅")

  } catch (error) {
    console.error("Error descargando:", error)
    await m.reply(`${error.message}`)
    await m.react("❌")
  }
}

const cleanName = (name) => name.replace(/[^\w\s-_.]/gi, "").substring(0, 50)

handler.command = handler.help = ["play", "playaudio", "ytmp3", "play2", "playvid", "ytv", "ytmp4"]
handler.tags = ["downloader"]
handler.register = true

export default handler
