import { WAMessageStubType } from '@whiskeysockets/baileys'

let handler = m => m

handler.before = async function (m, { conn }) {
    try {
        if (!m.messageStubType || !m.isGroup) return !0
        if (!global.db.data.chats[m.chat] || !global.db.data.chats[m.chat].welcome) return !0

        let userId = m.messageStubParameters[0]
        
        if (!userId) return !0
        
        const username = `@${userId.split('@')[0]}`
        const stubType = m.messageStubType
        
        const isAdd = stubType === WAMessageStubType.GROUP_PARTICIPANT_ADD
        const isRemove = stubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE || stubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE

        let textMessage = ''
        
        if (isAdd) {
            textMessage = `Bienvenido al grupo: ${username}`
        } else if (isRemove) {
            textMessage = `Adiós del grupo: ${username}`
        }

        if (textMessage) {
            await conn.sendMessage(m.chat, {
                text: textMessage,
                contextInfo: { mentionedJid: [userId] }
            })
        }

    } catch (e) {
        // console.error("Error en el evento de grupo:", e)
    }
}

export default handler
