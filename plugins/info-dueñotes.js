let handler = async (m, { conn, usedPrefix, command }) => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:𝐅𝐞𝐝𝐞 𝐔𝐜𝐡𝐢𝐡𝐚
ORG:𝐅𝐞𝐝𝐞 𝐔𝐜𝐡𝐢𝐡𝐚
TITLE:Epictetus, Enchiridion — Chapter 1 (verse 1)
TEL;type=CELL;waid=5491124918653:+5491124918653
ADR;type=WORK:;;2-chōme-7-5 Fuchūchō;Izumi;Osaka;594-0071;Japan
X-WA-BIZ-NAME:Ｓ𝐡𝐚𝐝𝐨𝐰 - 𝐁𝐨𝐭
X-WA-BIZ-DESCRIPTION:ꜱ𝐡𝐚𝐝𝐨𝐰, 𝐛𝐨𝐭 𝐜𝐫𝐞𝐚𝐝𝐨 𝐬𝐨𝐥𝐨 𝐩𝐨𝐫 𝐝𝐢𝐯𝐞𝐫𝐬𝐢ó𝐧 𝐮𝐰𝐮 ♡
X-WA-BIZ-HOURS:Mo-Su 00:00-23:59
END:VCARD`;

    const q = {
        key: {
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
        },
        message: {
            contactMessage: {
                displayName: "𝐅𝐞𝐝𝐞 𝐔𝐜𝐡𝐢𝐡𝐚",
                vcard,
            },
        },
    };

    await conn.sendMessage(
        m.chat,
        {
            contacts: {
                displayName: "𝐅𝐞𝐝𝐞 𝐔𝐜𝐡𝐢𝐡𝐚",
                contacts: [{ vcard }],
            },
            contextInfo: {
                externalAdReply: {
                    title: "𝘊𝘳𝘦𝘢𝘥𝘰𝘳 𝘥𝘦𝘭 𝘉𝘰𝘵 𝘹 𝘧𝘦𝘥𝘦 𝘜𝘤𝘩𝘪𝘩𝘢",
                    body: "Contacta con el CEO del bot.",
                    thumbnailUrl: "https://files.catbox.moe/2xlrwj.jpg",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        },
        { quoted: q }
    );
    
    const sections = [{
        title: "⚙️ Opciones de Contacto Rápido",
        rows: [
            { title: "Ver Comandos", rowId: `${usedPrefix}menu`, description: "Revisa la lista completa de comandos del bot." },
            { title: "Soporte", rowId: `${usedPrefix}support`, description: "Obtén información sobre cómo donar o ayudar al bot." },
            { title: "Reportar Fallo", rowId: `${usedPrefix}report`, description: "Envía un mensaje directo al desarrollador sobre un problema." }
        ]
    }];

    const listMessage = {
        text: "*¿Necesitas algo más?*",
        footer: "Selecciona una opción de la lista para continuar.",
        title: "--- Acciones Rápidas ---",
        buttonText: "Abrir Opciones",
        sections
    };

    await conn.sendMessage(m.chat, listMessage, { quoted: m });
};

handler.help = ["owner2"];
handler.tags = ["info"];
handler.command = ['owner2', 'creador2']

export default handler;
