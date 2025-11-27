let handler = async (m, { conn, usedPrefix, command }) => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:𝐅𝐞𝐝𝐞 𝐔𝐜𝐡𝐢𝐡𝐚 (𝐃𝐞𝐯)
ORG:Dev Team Advanced
TITLE:CEO & Developer
TEL;type=CELL;waid=5491124918653:+5491124918653
ADR;type=WORK:;;101 Dev Street;Tech City;California;90210;USA
X-WA-BIZ-NAME:𝐀𝐝𝐯𝐚𝐧𝐜𝐞 𝐁𝐨𝐭 𝐒𝐞𝐫𝐯𝐢𝐜𝐞𝐬
X-WA-BIZ-DESCRIPTION:Un bot con funciones avanzadas para automatización y diversión. ¡Siempre mejorando!
X-WA-BIZ-HOURS:Mo-Fr 09:00-17:00
END:VCARD`;

    const introText = `👋 ¡Hola! Soy el desarrollador principal de este bot.

Si tienes alguna pregunta, sugerencia o quieres reportar un error, aquí tienes mi contacto directo.`;
    await conn.reply(m.chat, introText, m);

    const q = {
        key: {
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
        },
        message: {
            contactMessage: {
                displayName: "𝐅𝐞𝐝𝐞 𝐔𝐜𝐡𝐢𝐡𝐚 (𝐃𝐞𝐯)",
                vcard,
            },
        },
    };

    await conn.sendMessage(
        m.chat,
        {
            contacts: {
                displayName: "𝐅𝐞𝐝𝐞 𝐔𝐜𝐡𝐢𝐡𝐚 (𝐃𝐞𝐯)",
                contacts: [{ vcard }],
            },
            contextInfo: {
                externalAdReply: {
                    title: "𝘋𝘦𝘷𝘦𝘭𝘰𝘱𝘦𝘳 𝘥𝘦𝘭 𝘉𝘰𝘵𝘹 𝘧𝘦𝘥𝘦 𝘜𝘤𝘩𝘪𝘩𝘢",
                    body: "Toca el contacto para chatear.",
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

handler.help = ["developer", "dev2"];
handler.tags = ["info", "menu"];
handler.command = ['developer2', 'dev2']

export default handler;
