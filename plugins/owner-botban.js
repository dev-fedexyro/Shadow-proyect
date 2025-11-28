let handler = async (m, { conn, command, isOwner }) => {
    if (!isOwner) {
        global.dfail('owner', m, conn); 
        return false;
    }
    
    const botName = conn.user.name || 'el bot';
    const banCommand = '.banear';
    const unbanCommand = '.desbanear';
    
    if (command.toLowerCase() === 'banear') {
        if (global.db.data.settings.isBanned) {
            return conn.reply(m.chat, `🌵 *¡Alerta!* ${botName} ya estaba *globalmente desactivado*. Solo responderé a ti, mi Creador.`, m);
        }
        
        global.db.data.settings.isBanned = true;
        
        const successMsg = `🛑 *¡Desactivación Global Activada!* 🛑\n\nDesde ahora, *${botName}* ha sido *desactivado* en *todos* los grupos y chats privados.\n\nSolo *tú*, el Creador, puedes usar comandos o interactuar conmigo.\n\nPara reactivarlo globalmente, usa el comando: *${unbanCommand}*`;
        return conn.reply(m.chat, successMsg, m);
    } 
    
    else if (command.toLowerCase() === 'desbanear') {
        if (!global.db.data.settings.isBanned) {
            return conn.reply(m.chat, `✅ *¡Alerta!* ${botName} ya estaba *globalmente activado*. Está listo para responder en todos los chats.`, m);
        }
        
        global.db.data.settings.isBanned = false;
        
        const successMsg = `🎉 *¡Activación Global Exitosa!* 🎉\n\n*${botName}* ha sido *activado* nuevamente en *todos* los grupos y chats privados.\n\nTodos los usuarios ahora pueden interactuar conmigo.\n\nPara desactivarlo globalmente, usa el comando: *${banCommand}*`;
        return conn.reply(m.chat, successMsg, m);
    }
}

handler.help = ['banear', 'desbanear'];
handler.tags = ['owner'];
handler.command = ['banear', 'desbanear'];
handler.rowner = true;

export default handler;
