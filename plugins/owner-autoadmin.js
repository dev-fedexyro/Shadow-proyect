let handler = async (m, { conn, isAdmin, isBotAdmin}) => {
    if (isAdmin) {
        throw '👑 *Ya eres administrador* en este grupo.';
}

    if (!isBotAdmin) {
        throw '🤖 *Necesito ser administrador* para poder otorgarte el permiso.';
}

    await conn.groupParticipantsUpdate(m.chat, [m.sender], "promote");

    m.reply('✅ *¡Hecho!* Ahora eres administrador del grupo.');
};

handler.help = ['autoadmin'];
handler.tags = ['owner'];
handler.command = ['autoadmin'];
handler.rowner = true;
handler.botAdmin = true;

export default handler;
