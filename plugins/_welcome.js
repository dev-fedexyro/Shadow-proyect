import fs from 'fs';
import { WAMessageStubType} from '@whiskeysockets/baileys';

const newsletterJid = '120363420231014623@newsletter';
const newsletterName = 'ѕнα∂σω • σƒƒι¢ιαℓ 👑';
const packname = 'Shadow Ultra MD';

async function generarBienvenida({ conn, userId, groupMetadata, chat}) {
  const username = `@${userId.split('@')[0]}`;
  const pp = await conn.profilePictureUrl(userId, 'image').catch(() => defaultIcono);
  const fecha = new Date().toLocaleDateString('es-ES', {
    timeZone: 'America/Santo_Domingo',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
});
  const groupSize = groupMetadata.participants.length + 1;
  const desc = groupMetadata.desc?.toString() || 'Sin descripción';

  let caption = chat.welcomeText
? chat.welcomeText
.replace(/@user/g, username)
.replace(/@subject/g, groupMetadata.subject)
.replace(/@desc/g, desc)
: `👋 ¡Hola ${username}!\nBienvenid@ al grupo *${groupMetadata.subject}*.\n\n🍃 *_Esperamos que disfrutes tu estadía._*\n\n📌 Información del grupo:\n• Miembros: ${groupSize}\n• Fecha: ${fecha}\n• Descripción: ${desc}`;

  return { pp, caption, mentions: [userId]};
}

async function generarDespedida({ conn, userId, groupMetadata, chat}) {
  const username = `@${userId.split('@')[0]}`;
  const pp = await conn.profilePictureUrl(userId, 'image').catch(() => defaultIcono);
  const fecha = new Date().toLocaleDateString('es-ES', {
    timeZone: 'America/Santo_Domingo',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
});
  const groupSize = groupMetadata.participants.length - 1;

  let caption = chat.byeText
? chat.byeText
.replace(/@user/g, username)
.replace(/@subject/g, groupMetadata.subject)
: `👋 ${username} ha salido del grupo *${groupMetadata.subject}*.\n\n🍃 *_Esperamos que haya disfrutado su tiempo con nosotros._*\n\n📉 Estado actual:\n• Miembros: ${groupSize}\n• Fecha: ${fecha}`;

  return { pp, caption, mentions: [userId]};
}

let handler = m => m;

handler.before = async function (m, { conn, participants, groupMetadata}) {
  if (!m.messageStubType ||!m.isGroup) return!0;

  const chat = global.db.data.chats[m.chat];
  if (!chat) return!0;

  const primaryBot = chat.botPrimario;
  if (primaryBot && conn.user.jid!== primaryBot) return!0;

  const userId = m.messageStubParameters[0];

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    const { pp, caption, mentions} = await generarBienvenida({ conn, userId, groupMetadata, chat});
    const contextInfo = {
      mentionedJid: mentions,
      isForwarded: true,
      forwardingScore: 999,
      forwardedNewsletterMessageInfo: {
        newsletterJid,
        newsletterName,
        serverMessageId: -1
},
      externalAdReply: {
        title: packname,
        body: '🍃 ¡Bienvenid@ al grupo!',
        thumbnailUrl: getRandomIcono(),
        sourceUrl: global.redes,
        mediaType: 1,
        renderLargerThumbnail: false
}
};
    await conn.sendMessage(m.chat, { image: { url: pp}, caption, contextInfo}, { quoted: null});
}

  if (
    chat.welcome &&
    (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE ||
     m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE)
) {
    const { pp, caption, mentions} = await generarDespedida({ conn, userId, groupMetadata, chat});
    const contextInfo = {
      mentionedJid: mentions,
      isForwarded: true,
      forwardingScore: 999,
      forwardedNewsletterMessageInfo: {
        newsletterJid,
        newsletterName,
        serverMessageId: -1
},
      externalAdReply: {
        title: packname,
        body: '🌿 Adiós que te choque un tren...',
        thumbnailUrl: getRandomIcono(),
        sourceUrl: global.redes,
        mediaType: 1,
        renderLargerThumbnail: false
}
};
    await conn.sendMessage(m.chat, { image: { url: pp}, caption, contextInfo}, { quoted: null});
}
};

export { generarBienvenida, generarDespedida};
export default handler;

const iconos = [
  'https://files.catbox.moe/12zb63.jpg',
  'https://files.catbox.moe/12zb63.jpg',
  'https://files.catbox.moe/12zb63.jpg'
];

const defaultIcono = 'https://files.catbox.moe/60z2ix.jpg';

function getRandomIcono() {
  return iconos[Math.floor(Math.random() * iconos.length)];
}
