import { search, download} from 'aptoide-scraper';

const rwait = '⏳';
const done = '✅';

const handler = async (m, { conn, usedPrefix, text}) => {
  if (!text) {
    return conn.reply(m.chat, '🍃 Por favor, ingrese el nombre de la APK que desea descargar.', m);
}

  try {
    await m.react(rwait);
    conn.reply(m.chat, '🌿 Descargando la aplicación, por favor espere...', m);

    const results = await search(text);
    if (!results.length) {
      return conn.reply(m.chat, '❌ No se encontraron resultados para esa búsqueda.', m);
}

    const appData = await download(results[0].id);
    const { name, package: pkg, lastup, size, icon, dllink} = appData;

    const infoMessage = `*📥 APTOIDE - DESCARGA DE APK*\n\n` +
                        `☁️ *Nombre:* ${name}\n` +
                        `🔖 *Paquete:* ${pkg}\n` +
                        `🚩 *Última actualización:* ${lastup}\n` +
                        `⚖️ *Tamaño:* ${size}`;

    await conn.sendFile(m.chat, icon, 'thumbnail.jpg', infoMessage, m);
    await m.react(done);

    const sizeMB = parseFloat(size.replace(' MB', '').replace(',', '.'));
    if (size.includes('GB') || sizeMB> 999) {
      return conn.reply(m.chat, '⚠️ El archivo es demasiado pesado para enviarlo por este medio.', m);
}

    await conn.sendMessage(
      m.chat,
      {
        document: { url: dllink},
        mimetype: 'application/vnd.android.package-archive',
        fileName: `${name}.apk`,
        caption: null
},
      { quoted: m}
);
} catch (error) {
    console.error('Error al descargar APK:', error);
    conn.reply(m.chat, `🍂 Ocurrió un error al intentar descargar la aplicación.\nUsa *${usedPrefix}report* para informarlo.\n\n${error.message}`, m);
}
};

handler.tags = ['downloader'];
handler.help = ['apk', 'modapk', 'aptoide'];
handler.command = ['apk', 'modapk', 'aptoide'];
handler.group = true;
handler.register = true;

export default handler;
