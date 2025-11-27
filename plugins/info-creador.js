let handler = async (m, { conn }) => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:𝐅𝐞𝐝𝐞 𝐔𝐜𝐡𝐢𝐡𝐚
ORG:𝐅𝐞𝐝𝐞 𝐔𝐜𝐡𝐢𝐡𝐚
TITLE:Epictetus, Enchiridion — Chapter 1 (verse 1)
TEL;type=CELL;waid=5491124918653:+5491124918653
ADR;type=WORK:;;2-chōme-7-5 Fuchūchō;Izumi;Osaka;594-0071;Japan
X-WA-BIZ-NAME:Ｓｈａｄｏｗ - Ｂｏｔ
X-WA-BIZ-DESCRIPTION:ꜱʜᴀᴅᴏᴡ, ʙᴏᴛ ᴄʀᴇᴀᴅᴏ ꜱᴏʟᴏ ᴘᴏʀ ᴅɪᴠᴇʀꜱɪóɴ ᴜᴡᴜ ♡
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
};

handler.help = ["owner"];
handler.tags = ["info"];
handler.command = ['owner', 'creador']

export default handler;
