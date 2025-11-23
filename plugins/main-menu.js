import fs from 'fs';
import fetch from 'node-fetch';

const getBuffer = async (url) => {
    try {
        const res = await fetch(url);
        if (res.status !== 200) {
            console.warn(`[getBuffer] Error al descargar la imagen: Código de estado ${res.status} para ${url}`);
            return null;
        }
        return await res.buffer();
    } catch (e) {
        console.error("[getBuffer] Error al obtener el buffer:", e);
        return null;
    }
};

let tags = {
  info: 'ɪɴғᴏʀᴍᴀᴄɪᴏ́ɴ',
  anime: 'ᴀɴɪᴍᴇ & ᴡᴀɪғᴜs',
  buscador: 'ʙᴜsᴄᴀᴅᴏʀᴇs',
  downloader: 'ᴅᴇsᴄᴀʀɢᴀs',
  jutsus: 'ᴊᴜᴛsᴜs ɴᴀʀᴜᴛᴏ',
  economy: 'ᴇᴄᴏɴᴏᴍɪ́ᴀ & ᴊᴜᴇɢᴏs',
  fun: 'ᴊᴜᴇɢᴏs ᴅɪᴠᴇʀᴛɪᴅᴏs',
  group: 'ғᴜɴᴄɪᴏɴᴇs ᴅᴇ ɢʀᴜᴘᴏ',
  ai: 'ɪɴᴛᴇʟɪɢᴇɴᴄɪᴀ ᴀʀᴛɪғɪᴄɪᴀʟ',
  game: 'ᴊᴜᴇɢᴏs ᴄʟᴀ́sɪᴄᴏs',
  serbot: 'sᴜʙ-ʙᴏᴛs',
  main: 'ᴄᴏᴍᴀɴᴅᴏs ᴘʀɪɴᴄɪᴘᴀʟᴇs',
  nable: 'ᴀᴄᴛɪᴠᴀʀ / ᴅᴇsᴀᴄᴛɪᴠᴀʀ',
  nsfw: 'ɴsғᴡ',
  owner: 'ᴅᴜᴇñᴏ / ᴀᴅᴍɪɴ',
  sticker: 'sᴛɪᴄᴋᴇʀs & ʟᴏɢᴏs',
  herramientas: 'ʜᴇʀʀᴀᴍɪᴇɴᴛᴀs'
};

function clockString(seconds) {
    if (typeof seconds !== 'number' || isNaN(seconds)) {
        seconds = 0;
    }
    const totalSeconds = Math.floor(seconds);
    let h = Math.floor(totalSeconds / 3600);
    let m = Math.floor((totalSeconds % 3600) / 60);
    let s = Math.floor(totalSeconds % 60);
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

let handler = async (m, { conn, usedPrefix }) => {
    const userId = m.sender;
    const nombre = await conn.getName(m.sender);
    const user = global.db.data.users[m.sender] || {};
    const totalreg = Object.keys(global.db.data.users).length;
    const uptime = clockString(process.uptime());
    const prefix = usedPrefix || '/'; 

    const groupsCount = Object.values(conn.chats).filter(v => v.id.endsWith('@g.us') && !v.read_only && v.presence !== 'unavailable').length;

    let categories = {};
    const defaultTag = 'otros';

    for (const plugin of Object.values(global.plugins)) {
        if (!plugin.help || !plugin.tags || plugin.tags.length === 0) continue;
        
        for (const tag of plugin.tags) {
            const categoryKey = tag.toLowerCase();
            if (!categories[categoryKey]) categories[categoryKey] = [];
            
            const commands = plugin.help.map(cmd => cmd);
            categories[categoryKey].push(...commands);
        }
    }

    const infoUser = `
❐ ʜᴏʟᴀ, sᴏʏ *_sʜᴀᴅᴏᴡ - ʙᴏᴛ_* 🌱

╰┈□ ɪɴғᴏ-ᴜsᴇᴇʀ
❐ _ᴜsᴜᴀʀɪᴏ:_ ${nombre}
❐ _ʀᴇɢɪsᴛʀᴀᴅᴏs:_ ${totalreg}

╰┈□ ɪɴғᴏ-ʙᴏᴛ
❐ _ᴛɪᴇᴍᴘᴏ ᴀᴄᴛɪᴠᴏ:_ ${uptime}
❐ _ᴘʀᴇғɪᴊᴏ:_ ```[ ${prefix} ]```
❐ _ɢʀᴜᴘᴏs ᴀᴄᴛɪᴠᴏs:_ ${groupsCount}
❐ _ғᴇᴄʜᴀ:_ ${new Date().toLocaleString('es-ES', { timeZone: 'America/Argentina/Buenos_Aires'})}
`.trim();

    let menuText = infoUser + '\n\n';

    for (const [tag, cmds] of Object.entries(categories)) {
        const tagName = tags[tag] || `╭─「 ${tag.toUpperCase()} 」
`;
        
        if (cmds.length > 0) {
            menuText += `${tagName}\n${cmds.map(cmd => `> ➩ ${cmd}`).join('\n')}\n\n`;
        }
    }

    try {
        const canalNombre = global.canalNombreM?.[0] || 'Shadow Bot';
        const canalId = global.canalIdM?.[0] || '';
        
        await conn.sendMessage(m.chat, {
            text: menuText,
            contextInfo: {
                externalAdReply: {
                    title: canalNombre,
                    body: '𝖲𝗁𝖺𝖽𝗈𝗐 - 𝖡𝗈𝗍',
                    thumbnailUrl: 'https://files.catbox.moe/12zb63.jpg',
                    sourceUrl: 'https://github.com/Shadows-club',
                    mediaType: 1,
                    renderLargerThumbnail: true
                },
                mentionedJid: [m.sender],
                isForwarded: true,
                forwardedNewsletterMessageInfo: canalId ? {
                    newsletterJid: canalId,
                    newsletterName: '𝖲𝗁𝖺𝖽𝗈𝗐 - 𝖡𝗈ƚ',
                    serverMessageId: -1
                } : undefined
            }
        }, { quoted: m });
    } catch (e) {
        console.error('❌ Error al enviar el menú:', e);
        await m.reply('❌ Ocurrió un error al enviar el menú. Por favor, reporta este error al dueño del bot.');
    }
};

handler.help = ['menu', 'menú', 'help'];
handler.tags = ['main'];
handler.command = ['menu', 'menú', 'help'];
handler.register = true;

export default handler;
