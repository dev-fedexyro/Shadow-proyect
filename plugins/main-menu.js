let tags = {
  info: 'ɪɴғᴏʀᴍᴀᴄɪᴏ́ɴ',
  anime: 'ᴀɴɪᴍᴇ & ᴡᴀɪғᴜs',
  buscador: 'ʙᴜsᴄᴀᴅᴏʀᴇs',
  downloader: 'ᴅᴇsᴄᴀʀɢᴀs',
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
❐ _ᴘʀᴇғɪᴊᴏ:_ [ ${prefix} ]
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

    try {
        const thumbnailUrl = global.fgThumb || 'https://files.catbox.moe/12zb63.jpg';
        const sourceUrl = global.gataMiau || 'https://github.com/Shadows-club';
        const canalUrl = 'https://whatsapp.com/channel/0029VbBG4i2GE56rSgXsqw2W';

        const buttons = [
            {
                urlButton: {
                    displayText: 'Canal Oficial 📢',
                    url: canalUrl,
                }
            }
        ];
        
        const buttonMessage = {
            text: menuText,
            footer: '© Shadow - Bot', 
            buttons: buttons,
            headerType: 1, 
            contextInfo: {
                externalAdReply: { 
                    title: '𝖲𝗁𝖺𝖽𝗈𝗐 - 𝖡𝗈ƚ',
                    body: 'Echa un vistazo a mi GitHub!', 
                    thumbnailUrl: thumbnailUrl,
                    sourceUrl: sourceUrl,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
                mentionedJid: [m.sender],
            }
        };

        await conn.sendMessage(m.chat, buttonMessage, { quoted: m });

    } catch (e) {
        console.error('❌ Error al enviar el menú con botón:', e);
        await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });
        await m.reply('❌ Ocurrió un error al enviar el menú con botón. Se envió como texto simple. Por favor, reporta este error al dueño del bot.');
    }
};

handler.help = ['menu', 'menú', 'help'];
handler.tags = ['main'];
handler.command = ['menu', 'menú', 'help'];
handler.register = true;

export default handler;
