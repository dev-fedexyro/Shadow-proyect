let handler = async (m, { conn}) => {
  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:𝘋𝘦𝘷-𝘧𝘦𝘥𝘦𝘹𝘺𝘻
ORG:𝘋𝘦𝘷-𝘧𝘦𝘥𝘦𝘹𝘺𝘻
TITLE:Epictetus, Enchiridion — Chapter 1 (verse 1)
EMAIL;type=INTERNET:fedelanyt20@gmail.com
TEL;type=CELL;waid=5491124918653:+5491124918653
ADR;type=WORK:;;2-chōme-7-5 Fuchūchō;Izumi;Osaka;594-0071;Japan
URL;type=WORK:https://www.instagram.com/dev-fedexyz13
X-WA-BIZ-NAME:Ｓｈａｄｏｗ - Ｂｏｔ
X-WA-BIZ-DESCRIPTION:🄲 𝘗𝘰𝘸𝘦𝘳𝘦𝘥 𝘣𝘺 𝘋𝘦𝘷-𝘧𝘦𝘥𝘦𝘹𝘺𝘻
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
        displayName: "𝘍𝘦𝘥𝘦 𝘜𝘤𝘩𝘪𝘩𝘢",
        vcard,
},
},
};

  await conn.sendMessage(
    m.chat,
    {
      contacts: {
        displayName: "𝘍𝘦𝘥𝘦 𝘜𝘤𝘩𝘪𝘩𝘢",
        contacts: [{ vcard}],
},
      contextInfo: {
        externalAdReply: {
          title: "© 2024–2025 Shadow Project",
          body: "📢 Canal oficial:\nhttps://whatsapp.com/channel/0029VbBG4i2GE56rSgXsqw2W\n\n👥 Grupo oficial:\nhttps://chat.whatsapp.com/LQd8pSCXPgh7iWE5rVdhOs?mode=hqrt3",
          thumbnailUrl: "https://files.catbox.moe/732quk.jpg",
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: "https://whatsapp.com/channel/0029VbBG4i2GE56rSgXsqw2W"
},
},
},
    { quoted: q}
);
};

handler.help = ["owner"];
handler.tags = ["info"];
handler.command = ['owner', 'creador'];

export default handler;
