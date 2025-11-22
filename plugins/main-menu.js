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
    info: '𓂂𓏸  𐅹੭੭   *`𝖨𝗇ẜᨣ`* 🪐 ᦡᦡ',
    anime: '𓂂𓏸  𐅹੭੭   *`𝖠𝗇ı𝗆ᧉ`* 🥞 ᦡᦡ',
    buscador: '𓂂𓏸  𐅹੭੭   *`Ｓᧉ𝖺ꭇ𝖼𝗁`* 🌿 ᦡᦡ',
    downloader: '𓂂𓏸  𐅹੭੭   *`𝖣ᨣ𝗐𝗇𝗅ᨣ𝖺𝖽ᧉꭇ𝗌`* 🍇 ᦡᦡ',
    economy: '𓂂𓏸  𐅹੭੭   *`𝖾𝖼𝗈𝗆𝗈𝗆𝗂𝖺`* 🌵 ᦡᦡ',
    fun: '𓂂𓏸  𐅹੭੭   *`𝖥𝗎𝗇`* 🌱 ᦡᦡ',
    group: '𓂂𓏸  𐅹੭੭   *`Gꭇußꭇ𝗎𝗉ᨣ𝗌`* ☕ ᦡ',
    ai: '𓂂𓏸  𐅹੭੭   *`𝖨𝗇ƚᧉ𝖨ı𝗀ᧉ𝗇𝖼ı𝖺𝗌`* 🧋 ᦡᦡ',
    game: '𓂂𓏸  𐅹੭੭   *`Game`* 🥞 ᦡᦡ',
    serbot: '𓂂𓏸  𐅹੭੭   *`𝖩𝖺𝖽ı-ᗷᨣƚ𝗌`* 🍂 ᦡᦡ',
    main: '𓂂𓏸  𐅹੭੭   *`𝖯ꭇ𝗂𝗇𝖼𝗂𝗉𝖺𝗅`* ☁️ ᦡᦡ',
    nable: '𓂂𓏸  𐅹੭੭   *`𝖮𝗇-𝖮ẜẜ`* 🍭 ᦡᦡ',
    nsfw: '𓂂𓏸  𐅹੭੭   *`𝖭𝗌ẜɯ`* 🪼 ᦡᦡ',
    owner: '𓂂𓏸  𐅹੭੭   *`Oɯ𝗇ᧉꭇ`* 🧇 ᦡᦡ',
    sticker: '𓂂𓏸  𐅹੭੭   *`𝖲ƚ𝗂𝖼𝗄ᧉꭇ`* ☘ ᦡᦡ',
    herramientas: '𓂂𓏸  𐅹੭੭   *`𝖧𝖾𝗋𝗋𝖺𝗆𝗂𝖾𝗇𝗍𝖺𝗌`* 🌻 ᦡᦡ'
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

    let menuText = infoUser + '\n\n';

    for (const [tag, cmds] of Object.entries(categories)) {
        const tagName = tags[tag] || `𓂂𓏸  𐅹੭੭   * ${tag.toUpperCase()}* 🌾 ᦡᦡ`;
        
        if (cmds.length > 0) {
            menuText += `${tagName}\n${cmds.map(cmd => `➩ ${cmd}`).join('\n')}\n\n`;
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
