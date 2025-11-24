import yts from 'yt-search';

const handler = async (m, { text, conn, command}) => {
  if (!text) {
    return conn.reply(m.chat, '\`\`\`🌵 ¿Qué deseas buscar en YouTube.\`\`\`', m);
}

  conn.reply(m.chat, '\`\`\`🔍 Buscando en YouTube, un momento.\`\`\`', m);

  try {
    const { all} = await yts(text);
    const videos = all.filter(v => v.type === 'video');

    if (!videos.length) {
      return conn.reply(m.chat, '\`\`\`❌ No se encontraron resultados.\`\`\`', m);
}

    const formattedResults = videos.map(v => (
      `「✦」*${v.title}*\n` +
      `🍬 Canal: *${v.author.name}*\n` +
      `🕝 Duración: *${v.timestamp}*\n` +
      `📆 Subido: *${v.ago}*\n` +
      `👀 Vistas: *${v.views.toLocaleString()}*\n` +
      `🔗 Enlace: ${v.url}`
)).join('\n\n••••••••••••••••••••••••••••••••••••\n\n');

    await conn.sendFile(m.chat, videos[0].thumbnail, 'yts.jpeg', formattedResults, m);
} catch (error) {
    console.error(error);
    conn.reply(m.chat, '\`\`\`⚠️ Ocurrió un error al buscar en YouTube.\`\`\`', m);
}
};

handler.help = ['ytbuscar', 'ytsearch', 'yts'];
handler.tags = ['buscador'];
handler.command = ['ytbuscar', 'ytsearch', 'yts'];
handler.register = true;
handler.coin = 1;

export default handler;
