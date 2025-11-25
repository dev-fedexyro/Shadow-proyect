import ws from "ws";

async function getBufferFromUrl(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error al descargar la imagen: ${response.statusText}`);
    }
    return Buffer.from(await response.arrayBuffer());
}

function convertirMsADiasHorasMinutosSegundos(ms) {
    if (ms < 0) return "Desconocido";

    const segundos = Math.floor(ms / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    const segRest = segundos % 60;
    const minRest = minutos % 60;
    const horasRest = horas % 24;

    let resultado = "";
    if (dias > 0) resultado += `${dias} días, `;
    if (horasRest > 0) resultado += `${horasRest} horas, `;
    if (minRest > 0) resultado += `${minRest} minutos, `;
    resultado += `${segRest} segundos`;
    
    return resultado.trim();
}

const handler = async (m, { conn, usedPrefix, command, participants }) => {
    try {
        const thumbnailURL = 'https://files.catbox.moe/hv7nvc.jpg';
        let thumbnailBase64 = null;
        try {
             const buffer = await getBufferFromUrl(thumbnailURL);
             thumbnailBase64 = buffer.toString('base64');
        } catch (e) {
             console.error("Error al obtener la miniatura, se omitirá.", e);
        }
        
        const activeBotsJids = [
            global.conn.user.jid,
            ...new Set(global.conns
                .filter(c => c.user && c.ws?.socket?.readyState !== ws.CLOSED)
                .map(c => c.user.jid))
        ];

        const participantsJids = participants.map(p => p.id);
        
        let groupBotsJids = activeBotsJids.filter(jid => participantsJids.includes(jid));
        
        const botsGroupDetails = groupBotsJids.length > 0 ? groupBotsJids.map((botJid) => {
            const isMainBot = botJid === global.conn.user.jid;
            const botConn = global.conns.find(c => c.user?.jid === botJid);
            
            let uptimeDisplay = "Desconocido";
            if (isMainBot) {
                uptimeDisplay = convertirMsADiasHorasMinutosSegundos(Date.now() - global.conn.uptime);
            } else if (botConn?.uptime) {
                uptimeDisplay = convertirMsADiasHorasMinutosSegundos(Date.now() - botConn.uptime);
            } else {
                uptimeDisplay = "Activo (sin Uptime registrado)";
            }

            const mention = botJid.split('@')[0];
            return `@${mention}\n> Bot: ${isMainBot ? 'Principal' : 'Sub-Bot'}\n> Online: ${uptimeDisplay}`;
        }).join("\n\n") : `☆ No hay Sub-Bots activos en este grupo.`;

        const totalSubs = activeBotsJids.length - 1;

        const message = `\`\`\`「 🌱 」 Lista de Bots Activos (Shadow-Bots)\`\`\`

*🌑 Bots Totales:* ${activeBotsJids.length}
*↳ Principal:* 1
*↳ Sub-Bots:* ${totalSubs}

*☆ Bots en este Grupo:* ${groupBotsJids.length}

${botsGroupDetails}`;

        const mentionList = groupBotsJids; 
        
        const contextInfo = { 
            contextInfo: { 
                mentionedJid: mentionList,
                externalAdReply: { 
                    title: "ᴏᴡɴᴇʀ: ꜰᴇᴅᴇ ᴜᴄʜɪʜᴀ 🌵",
                    body: "ꜱʜᴀᴅᴏᴡ ꜱᴜʙ-ʙᴏᴛꜱ 🌱",
                    sourceUrl: "https://github.com/",
                    thumbnail: thumbnailBase64 ? Buffer.from(thumbnailBase64, 'base64') : undefined,
                    mediaType: 1
                }
            }
        };

        if (thumbnailBase64) {
             contextInfo.contextInfo.jpegThumbnail = Buffer.from(thumbnailBase64, 'base64');
        }

        await conn.sendMessage(m.chat, { text: message, ...contextInfo }, { quoted: m });

    } catch (error) {
        console.error("Error en el handler de Shadow-bots:", error);
        m.reply(`⚠️ *Se ha producido un problema inesperado.*
> Intenta nuevamente o usa *${usedPrefix}report* para informarlo.
> Detalles: ${error.message}`);
    }
};

handler.tags = ["serbot"];
handler.help = ["botlist", "listbots", "listbot", "bots", "shadowbots", "shadowbot"];
handler.command = ["botlist", "listbots", "listbot", "bots", "shadowbots", "shadowbot"];

export default handler;
