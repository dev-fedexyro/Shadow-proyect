import { xpRange } from '../lib/levelling.js';
import fetch from 'node-fetch';

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
  herramientas: 'ʜᴇʀʀᴀᴍɪᴇɴᴛᴀs',
  otros: 'ᴏᴛʀᴏs'
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
    try {
        const userId = m.sender;
        const nombre = await conn.getName(userId);
        const totalreg = Object.keys(global.db?.data?.users || {}).length;
        const uptime = clockString(process.uptime());
        const prefix = usedPrefix || '/'; 

        const groupsCount = Object.values(conn.chats || {}).filter(v => v.id?.endsWith('@g.us') && !v.read_only && v.presence !== 'unavailable').length;

        let categorizedCommands = {};
        const defaultTagKey = 'otros';

        Object.values(global.plugins || {})
            .filter(plugin => plugin.help && !plugin.disabled)
            .forEach(plugin => {
                const pluginTags = Array.isArray(plugin.tags) ? plugin.tags : (typeof plugin.tags === 'string' ? [plugin.tags] : [defaultTagKey]);
                
                const tagKey = pluginTags[0]?.toLowerCase() || defaultTagKey;
                
                const commands = Array.isArray(plugin.help) ? plugin.help : (typeof plugin.help === 'string' ? [plugin.help] : []);
                
                if (commands.length > 0) {
                    categorizedCommands[tagKey] = categorizedCommands[tagKey] || new Set();
                    commands.forEach(cmd => categorizedCommands[tagKey].add(cmd));
                }
            });

        const infoUser = `
❐ 𝖧𝗈𝗅𝖺, 𝖲𝗈𝗒 *_𝖲𝗁𝖺𝖽𝗈𝗐 - 𝖡𝗈𝗍_* 🌱

╰┈□ 𝖨𝖭𝖥𝖮-𝖴𝖲𝖤𝖤𝖱
❐ _Usuario:_ ${nombre}
❐ _Registrados:_ ${totalreg}

╰┈□ 𝖨𝖭𝖥𝖣-𝖡𝖮𝖳
❐ _Tiempo activo:_ ${uptime}
❐ _Prefijo:_ \`\`\`[ ${prefix} ]\`\`\`
❐ _Grupos activos:_ ${groupsCount}
❐ _Fecha:_ ${new Date().toLocaleString('es-ES', { timeZone: 'America/Argentina/Buenos_Aires' })}
`.trim();

        let menuBody = '';
        for (const [tag, cmds] of Object.entries(categorizedCommands)) {
            const tagName = tags[tag] || `🌱 ${tag.toUpperCase()}`; 
            
            if (cmds.size > 0) {
                menuBody += `\n╭─「 ${tagName} 」\n`; 
                menuBody += [...cmds].map(cmd => `│ ➩ ${prefix}${cmd}`).join('\n');
                menuBody += `\n╰───────────────╯\n`;
            }
        }
        
        const fullMenu = `${infoUser}\n\n${menuBody.trim()}`;

        const canalNombre = global.canalNombreM?.[0] || 'Shadow Bot';
        const canalId = global.canalIdM?.[0] || '';
        const thumbnailUrl = 'https://files.catbox.moe/12zb63.jpg';

        await conn.sendMessage(m.chat, {
            text: fullMenu,
            contextInfo: {
                externalAdReply: {
                    title: canalNombre,
                    body: '𝖲𝗁𝖺𝖽𝗈𝗐 - 𝖡𝗈𝗍',
                    thumbnailUrl: thumbnailUrl,
                    sourceUrl: 'https://github.com/Shadows-club',
                    mediaType: 1,
                    renderLargerThumbnail: true
                },
                mentionedJid: [userId],
                isForwarded: true,
                forwardedNewsletterMessageInfo: canalId ? {
                    newsletterJid: canalId,
                    newsletterName: '𝖲𝗁𝖺𝖽𝗈𝗐 - 𝖡𝗈ƚ',
                    serverMessageId: -1
                } : undefined
            }
        }, { quoted: m });

    } catch (e) {
        console.error('❌ Error general al enviar el menú:', e);
        await m.reply('⚠️ Ocurrió un error al generar y enviar el menú. Por favor, reporta este error al dueño del bot.');
    }
};

handler.help = ['menu', 'menú', 'help'];
handler.tags = ['main'];
handler.command = ['menu', 'menú', 'help'];
handler.register = true;

export default handler;
