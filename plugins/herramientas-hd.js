import fetch from 'node-fetch'
import FormData from 'form-data'

const handler = async (m, { conn, usedPrefix}) => {
  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || q.mediaType || ''

  if (!mime) return conn.reply(m.chat, '🌱 Por favor, responde a una imagen con el comando.', m)
  if (!/image\/(jpe?g|png)/.test(mime)) return conn.reply(m.chat, `🌵 Formato no compatible (${mime}). Usa una imagen JPG o PNG.`, m)

  const buffer = await q.download()
  if (!buffer || buffer.length < 1000) return conn.reply(m.chat, '🌱 Imagen no válida o demasiado pequeña.', m)

  await m.react('🌱')

  try {
    const url = await uploadToUguu(buffer)
    const engines = [upscaleSiputzx, upscaleVreden]

    const wrapped = engines.map(fn =>
      fn(url)
.then(res => ({ engine: fn.engineName, result: res}))
.catch(err => Promise.reject({ engine: fn.engineName, error: err}))
)

    const { engine, result} = await Promise.any(wrapped)

    await conn.sendFile(
      m.chat,
      Buffer.isBuffer(result)? result: result,
      'imagen.jpg',
      `🌵 Imagen mejorada\n✔️ Procesada con éxito.\n🔧 Servidor: \`${engine}\``,
      m
)

    await m.react('🌵')
} catch (err) {
    await m.react('🌱')

    const fallback = Array.isArray(err.errors)
? err.errors.map(e => `• ${e?.engine || 'Desconocido'}: ${e?.error?.message || e?.message || String(e)}`).join('\n')
: `• ${err?.engine || 'Desconocido'}: ${err?.error?.message || err?.message || String(err)}`

    await conn.reply(
      m.chat,
      `🌱 Error, no se pudo mejorar la imagen.\n\n${fallback}`,
      m
)
}
}

handler.command = ['hd', 'remini', 'enhance']
handler.help = ['hd', 'remini', 'enhance']
handler.tags = ['herramientas']

export default handler

async function uploadToUguu(buffer) {
  const body = new FormData()
  body.append('files[]', buffer, 'image.jpg')

  const res = await fetch('https://uguu.se/upload.php', {
    method: 'POST',
    body,
    headers: body.getHeaders()
})

  const text = await res.text()
  try {
    const json = JSON.parse(text)
    const url = json.files?.[0]?.url
    if (!url ||!url.startsWith('https://')) throw new Error(`Respuesta inválida de Uguu.\n> ${text}`)
    return url.trim()
} catch (e) {
    throw new Error(`Falló al parsear respuesta de Uguu.\n> ${text}`)
}
}

async function upscaleSiputzx(url) {
  const res = await fetch(`${global.APIs.siputzx.url}/api/iloveimg/upscale?image=${encodeURIComponent(url)}&scale=4`)
  if (!res.ok) throw new Error(`Siputzx falló con código ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}
upscaleSiputzx.engineName = 'Siputzx'

async function upscaleVreden(url) {
  const res = await fetch(`${global.APIs.vreden.url}/api/artificial/hdr?url=${encodeURIComponent(url)}&pixel=4`)
  if (!res.ok) throw new Error(`Vreden falló con código ${res.status}`)
  const json = await res.json()

  const finalUrl = json?.resultado?.datos?.descargaUrls?.[0]
  if (!finalUrl || typeof finalUrl!== 'string' ||!finalUrl.startsWith('https://')) {
    throw new Error('Respuesta inválida de Vreden: no se encontró una URL válida.')
}

  return finalUrl
}
upscaleVreden.engineName = 'Vreden'
