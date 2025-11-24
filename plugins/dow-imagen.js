import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix}) => {
  if (!text) {
    return conn.reply(
      m.chat,
      '\`\`\`🌱 Por favor, ingresa un texto para buscar una imagen.\`\`\`',
      m
);
}

  try {
    await m.react('🕒');

    const res = await getGoogleImageSearch(text);
    const urls = await res.getAll();

    if (urls.length < 2) {
      return conn.reply(
        m.chat,
        '\`\`\`🌵 No se encontraron suficientes imágenes para crear un álbum.\`\`\`',
        m
);
}

    const medias = urls.slice(0, 10).map(url => ({
      type: 'image',
      data: { url},
}));

    const caption = `\`\`\`🌱 Resultados de búsqueda para:\`\`\` ${text}`;
    await conn.sendSylphy(m.chat, medias, { caption, quoted: m});

    await m.react('✔️');
} catch (error) {
    await m.react('✖️');
    conn.reply(
      m.chat,
      `\`\`\`🌵 Ocurrió un problema al buscar imágenes.\`\`\`\n\n\`\`\`📄 Detalles:\`\`\` ${error.message}`,
      m
);
}
};

handler.help = ['imagen', 'image', 'img'];
handler.tags = ['downloader'];
handler.command = ['imagen', 'image', 'img'];

export default handler;

function getGoogleImageSearch(query) {
  const apis = [
    `${global.APIs.delirius.url}/search/gimage?query=${encodeURIComponent(query)}`,
    `${global.APIs.siputzx.url}/api/images?query=${encodeURIComponent(query)}`,
  ];

  return {
    getAll: async () => {
      for (const url of apis) {
        try {
          const res = await axios.get(url);
          const data = res.data;
          if (Array.isArray(data?.data)) {
            const urls = data.data
.map(d => d.url)
.filter(u => typeof u === 'string' && u.startsWith('http'));
            if (urls.length) return urls;
}
} catch {

}
}
      return [];
},
    getRandom: async () => {
      const all = await this.getAll();
      return all[Math.floor(Math.random() * all.length)] || null;
},
};
      }
