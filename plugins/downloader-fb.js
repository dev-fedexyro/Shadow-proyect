import axios from "axios";

async function fbdl(url) {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0'
};
    const html = (await axios.get(url, { headers})).data;
    const hd = html.match(/"browser_native_hd_url":"(.*?)"/)?.[1]?.replace(/\\\//g, "/") || null;
    const sd = html.match(/"browser_native_sd_url":"(.*?)"/)?.[1]?.replace(/\\\//g, "/") || null;
    return { status: "success", hd, sd};
} catch (e) {
    return { status: "error", message: e.message};
}
}

let handler = async (m, { conn, text}) => {
  if (!text) {
    return conn.reply(m.chat, `\`\`\`🌱 Uso correcto:\n/fb <link de Facebook>\`\`\`\n\n\`\`\`🌵Ejemplo:\n/fb https://www.facebook.com/share/v/.\`\`\``, m, global.rcanal);
            }

  await conn.reply(m.chat, '\`\`\`🌵 Descargando su video, espere...\`\`\`');

  try {
    const result = await fbdl(text);
    if (result.status!== "success") throw result.message;

    const url = result.hd || result.sd;
    if (!url) throw '\`\`\`🌱 No se encontró video descargable. Revisa el enlace.\`\`\`';

    await conn.sendMessage(m.chat, {
      video: { url},
      caption: `\`\`\`🌱 𝖵𝗂𝖽𝖾𝗈 𝖽𝖾𝗌𝖼𝖺𝗋𝗀𝖺𝖽𝗈 𝖼𝗈𝗋𝗋𝖾𝖼𝗍𝖺𝗆𝖾𝗇𝗍𝖾\`\`\`\n\n🔗 *𝖥𝗎𝖾𝗇𝗍𝖾:* 𝖥𝖺𝖼𝖾𝖻𝗈𝗈𝗄\n🎥 *𝖢𝖺𝗅𝗂𝖽𝖺𝖽:* ${result.hd? 'HD 🌵': 'SD 🌱'}`
}, { quoted: m});

} catch (e) {
    await conn.reply(m.chat, `\`\`\`❌ Error al descargar\`\`\`\n> ${e}`);
}
};

handler.help = ['fb', 'facebook'];
handler.tags = ['downloader'];
handler.command = ['fb', 'facebook'];

export default handler;
