const handler = async (m, { conn}) => {

  if (!m.quoted) {
    return conn.reply(m.chat, '\`\`\`🌱 Por favor, menciona al usuario que deseas eliminar.\`\`\`', m);
}

  try {
 
    const participant = m.message.extendedTextMessage.contextInfo.participant;
    const stanzaId = m.message.extendedTextMessage.contextInfo.stanzaId;

    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: stanzaId,
        participant: participant
}
});
} catch (error) {

    try {
      await conn.sendMessage(m.chat, {
        delete: m.quoted.vM.key
});
} catch (err) {
      console.error('❌ Error al eliminar el mensaje:', err);
      conn.reply(m.chat, '\`\`\`🍭 No se pudo eliminar el mensaje. Asegúrate de que sea válido y que el bot tenga permisos.\`\`\`', m);
}
}
};

handler.help = ['delete'];
handler.tags = ['group'];
handler.command = ['del', 'delete'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
