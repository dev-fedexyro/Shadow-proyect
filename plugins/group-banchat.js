let handler = async (m, { conn, usedPrefix, command, args, isAdmin }) => {
    if (!isAdmin) {
        global.dfail('admin', m, conn);
        return false;
    }
    
    const chat = global.db.data.chats[m.chat];
    const botName = conn.user.name || 'el bot';
    
    if (command.toLowerCase() !== 'bot') return;

    if (args.length === 0) {
        const estado = chat.isBanned ? '❌ Desactivado' : '✅ Activado';
        const info = `⚙️ Un administrador puede activar o desactivar a *${botName}* utilizando:\n\n* Activar* » *${usedPrefix}bot on*\n* Desactivar* » *${usedPrefix}bot off*\n\n✅ Estado actual » *${estado}*`;
        return conn.reply(m.chat, info, m);
    }
    
    const action = args[0].toLowerCase();

    if (action === 'off') {
        if (chat.isBanned) {
            return conn.reply(m.chat, `🌵 *${botName}* ya estaba *desactivado* para este grupo.`, m);
        }
        chat.isBanned = true;
        return conn.reply(m.chat, `🌱 Has *desactivado* a ${botName} en este grupo.`, m);
        
    } else if (action === 'on') {
        if (!chat.isBanned) {
            return conn.reply(m.chat, `✅ *${botName}* ya estaba *activado* para este grupo.`, m);
        }
        chat.isBanned = false;
        return conn.reply(m.chat, `✅ Has *activado* a ${botName} en este grupo.`, m);
    } else {
        return conn.reply(m.chat, `❌ Argumento inválido. Usa *${usedPrefix}bot on* o *${usedPrefix}bot off*.`, m);
    }
}

handler.help = ['bot'];
handler.tags = ['group'];
handler.command = ['bot'];
handler.admin = true;

export default handler;
