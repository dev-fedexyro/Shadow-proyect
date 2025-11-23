import { WAMessageStubType } from '@whiskeysockets/baileys';

const TIME_ZONE = "America/Santo_Domingo"; 

const DEFAULT_WELCOME_PP = 'https://files.catbox.moe/12zb63.jpg';
const DEFAULT_BYE_PP = 'https://files.catbox.moe/12zb63.jpg';

async function generateWelcomeMessage({ conn, userId, groupMetadata, chat }) {
  const username = `@${userId.split('@')[0]}`;
  
  const pp = await conn.profilePictureUrl(userId, 'image').catch(() => DEFAULT_WELCOME_PP);
  
  const formattedDate = new Date().toLocaleDateString("es-ES", { timeZone: TIME_ZONE, day: 'numeric', month: 'long', year: 'numeric' });
  const groupSize = groupMetadata.participants.length + 1;
  const desc = groupMetadata.desc?.toString() || 'Sin descripción establecida.';

  let caption;
  const subject = groupMetadata.subject;

  if (chat.welcomeText) {
    caption = chat.welcomeText
      .replace(/@user/g, username)
      .replace(/@subject/g, subject)
      .replace(/@desc/g, desc);
  } else {
    const defaultWelcomeMessage = `👋 **¡BIENVENID@ AL GRUPO!** 🎉
    
¡Hola @user! 
Te damos una cordial bienvenida a **@subject**.

Esperamos que disfrutes tu estancia y respetes las normas.

---
**✨ INFORMACIÓN DEL GRUPO**
*👥 Miembros:* ${groupSize}
*📅 Fecha de Ingreso:* ${formattedDate}
*📜 Descripción:*
${desc}
---
    
_¡Que tengas un excelente día!_`;

    caption = defaultWelcomeMessage
      .replace(/@user/g, username)
      .replace(/@subject/g, subject);
  }
  
  return { pp, caption, mentions: [userId] };
}

async function generateGoodbyeMessage({ conn, userId, groupMetadata, chat }) {
  const username = `@${userId.split('@')[0]}`;
  
  const pp = await conn.profilePictureUrl(userId, 'image').catch(() => DEFAULT_BYE_PP);
  
  const formattedDate = new Date().toLocaleDateString("es-ES", { timeZone: TIME_ZONE, day: 'numeric', month: 'long', year: 'numeric' });
  const groupSize = groupMetadata.participants.length - 1;

  let caption;
  const subject = groupMetadata.subject;

  if (chat.byeText) {
    caption = chat.byeText
      .replace(/@user/g, username)
      .replace(/@subject/g, subject);
  } else {
    const defaultByeMessage = `🚪 **HASTA PRONTO** 😞
    
@user ha abandonado el grupo **@subject**.
Su presencia se echará de menos.

---
**📉 ESTADO ACTUAL**
*Miembros restantes:* ${groupSize}
*📅 Fecha de Salida:* ${formattedDate}
---
    
_¡Mucha suerte en tus futuros proyectos!_`;

    caption = defaultByeMessage
      .replace(/@user/g, username)
      .replace(/@subject/g, subject);
  }
  
  return { pp, caption, mentions: [userId] };
}

let handler = m => m;

handler.before = async function (m, { conn, groupMetadata }) {
    if (!m.messageStubType || !m.isGroup) return !0;

    const chat = global.db.data.chats[m.chat];
    if (!chat) return !0;

    const primaryBot = chat.botPrimario;
    if (primaryBot && conn.user.jid !== primaryBot) return !0;

    const userId = m.messageStubParameters[0];

    if (chat.welcome && m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_ADD) {
        const { pp, caption, mentions } = await generateWelcomeMessage({ conn, userId, groupMetadata, chat });
        
        await conn.sendMessage(m.chat, { 
            image: { url: pp }, 
            caption, 
            mentions
        }, { quoted: null });
    }

    if (chat.welcome && 
        (m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_REMOVE || 
         m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_LEAVE)) {
        
        const { pp, caption, mentions } = await generateGoodbyeMessage({ conn, userId, groupMetadata, chat });
        
        await conn.sendMessage(m.chat, { 
            image: { url: pp }, 
            caption, 
            mentions
        }, { quoted: null });
    }
};

export { generateWelcomeMessage, generateGoodbyeMessage };
export default handler;
