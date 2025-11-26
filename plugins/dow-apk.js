import { search, download} from 'aptoide-scraper'

const MAX_APK_SIZE_MB = 100

const handler = async (m, { conn, text}) => {
  if (!text) {
    return conn.reply(m.chat, '🌱 Por favor, ingrese el nombre de la APK que desea buscar.', m)
}

  try {
    await m.react('🕒')

    const results = await search(text)
    if (!results?.length) {
      await m.react('⚠️')
      return conn.reply(m.chat, '❌ No se encontraron resultados para esa búsqueda.', m)
    }

    const { name, package: pkg, lastup, size, icon, dllink} = await download(results[0].id)

    const appInfo = `*APTOIDE - DESCARGAS*\n\n` +
                    `🌱 Nombre: ${name}\n` +
                    `📚 Paquete: ${pkg}\n` +
                    `📩 Última actualización: ${lastup}\n` +
                    `🌵 Tamaño: ${size}`

    await conn.sendFile(m.chat, icon, 'thumbnail.jpg', appInfo, m)

    let sizeInMB = 0
    const rawSize = size.toUpperCase().replace(',', '.')

    if (rawSize.includes('GB')) {
      sizeInMB = parseFloat(rawSize.replace(' GB', '')) * 1024
    } else if (rawSize.includes('MB')) {
      sizeInMB = parseFloat(rawSize.replace(' MB', ''))
    }

    if (sizeInMB > MAX_APK_SIZE_MB) {
      await m.react('⚠️')
      return conn.reply(
        m.chat,
        `⚠️ El archivo (${size}) es demasiado pesado. Límite: ${MAX_APK_SIZE_MB} MB.`,
        m
      )
    }

    await conn.sendMessage(
      m.chat,
      {
        document: { url: dllink},
        mimetype: 'application/vnd.android.package-archive',
        fileName: `${name}.apk`,
        caption: `✅ **${name}** APK lista para instalar.`
      },
      { quoted: m}
    )

    await m.react('✅')

  } catch (error) {
    console.error('Error al descargar APK:', error)
    await m.react('✖️')
    return conn.reply(
      m.chat,
      `⚠︎ Error en la descarga.\n*Detalle:* ${error.message}`,
      m
    )
  }
}

handler.tags = ['descargas']
handler.help = ['apk', 'modapk', 'aptoide']
handler.command = ['apk', 'modapk', 'aptoide']
handler.group = true
handler.premium = true

export default handler
