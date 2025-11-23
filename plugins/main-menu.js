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

/**
 * Convierte segundos en formato HH:MM:SS
 * @param {number} seconds
 * @returns {string}
 */
function clockString(seconds) {
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
        seconds = 0;
    }
    const totalSeconds = Math.floor(seconds);
    let h = Math.floor(totalSeconds / 3600);
    let m = Math.floor((totalSeconds % 3600) / 60);
    let s = Math.floor(totalSeconds % 60);
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

let handler = async (m, { conn, usedPrefix }) => {
    const nombre = await conn.getName(m.sender);
    const totalreg = Object.keys(global.db.data.users).length;
    const uptime = clockString(process.uptime());
    const prefix = usedPrefix || '/'; 
    const groupsCount = Object.values(conn.chats).filter(v => v.id.endsWith('@g.us') && !v.read_only && v.presence !== 'unavailable').length;

    let categories = {};

    for (const plugin of Object.values(global.plugins)) {
        if (!plugin.help || !plugin.tags || plugin.tags.length === 0) continue;
        
        const commands = plugin.help
            .filter(cmd => !cmd.startsWith('#') && cmd !== 'menu' && cmd !== 'menú' && cmd !== 'help')
            .map(cmd => `${prefix}${cmd}`);
            
        if (commands.length === 0) continue;

        for (const tag of plugin.tags) {
            const categoryKey = tag.toLowerCase();
            if (!categories[categoryKey]) categories[categoryKey] = [];
            
            categories[categoryKey].push(...commands.filter(cmd => !categories[categoryKey].includes(cmd)));
        }
    }

    const infoUser = `
❐ ʜᴏʟᴀ, sᴏʏ *_sʜᴀᴅᴏᴡ - ʙᴏᴛ_* 🌱

╰┈□ ɪɴғᴏ-ᴜsᴇᴇʀ
❐ _ᴜsᴜᴀʀɪᴏ:_ ${nombre}
❐ _ʀᴇɢɪsᴛʀᴀᴅᴏs:_ ${totalreg}

╰┈□ ɪɴғᴏ-ʙᴏᴛ
❐ _ᴛɪᴇᴍᴘᴏ ᴀᴄᴛɪᴠᴏ:_ ${uptime}
❐ _ᴘʀᴇғɪᴊᴏ:_ \`\`\`[ ${prefix} ]\`\`\`
❐ _ɢʀᴜᴘᴏs ᴀᴄᴛɪᴠᴏs:_ ${groupsCount}
❐ _ғᴇᴄʜᴀ:_ ${new Date().toLocaleString('es-ES', { timeZone: 'America/Argentina/Buenos_Aires'})}
`.trim();

    let menuText = infoUser + '\n\n';
    
    const sortedTags = Object.keys(tags).filter(tag => categories[tag] && categories[tag].length > 0);

    for (const tag of sortedTags) {
        const tagName = tags[tag] || `${tag.toUpperCase()} `;
        const cmds = categories[tag].sort(); 
        
        if (cmds.length > 0) {
            menuText += `╭─「${tagName}」\n${cmds.map(cmd => `➩ ${cmd}`).join('\n')}\n\n`;
        }
    }

    const VIDEO_URL = 'https://cdn.russellxz.click/14cf14e9.mp4';
    const THUMBNAIL_URL = 'https://files.catbox.moe/12zb63.jpg';

    try {
        const canalNombre = global.canalNombreM?.[0] || 'Shadow Bot - Canal';
        const canalId = global.canalIdM?.[0] || ''; 
        const sourceUrl = global.gataMiau || 'https://github.com/Shadows-club';
        
        await conn.sendMessage(m.chat, {
            text: menuText,
            contextInfo: {
                externalAdReply: {
                    title: canalNombre,
                    body: '𝖲𝗁𝖺𝖽𝗈𝗐 - 𝖡𝗈ƚ',
                    mediaUrl: VIDEO_URL, 
                    thumbnailUrl: THUMBNAIL_URL,
                    sourceUrl: sourceUrl,
                    mediaType: 2, 
                    renderLargerThumbnail: true
                },
                mentionedJid: [m.sender],
                isForwarded: true,
                forwardedNewsletterMessageInfo: canalId && canalId.includes('@newsletter') ? {
                    newsletterJid: canalId,
                    newsletterName: '𝖲𝗁𝖺𝖽𝗈𝗐 - 𝖡𝗈ƚ',
                    serverMessageId: -1
                } : undefined
            }
        }, { quoted: m });
    } catch (e) {
        console.error('❌ Error al enviar el menú con video:', e);
        await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });
        await m.reply('❌ Ocurrió un error al enviar el menú con video. Se envió la versión de solo texto.');
    }
};

handler.help = ['menu', 'menú', 'help'];
handler.tags = ['main'];
handler.command = ['menu', 'menú', 'help'];
handler.register = true;

export default handler;
