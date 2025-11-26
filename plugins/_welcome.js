let handler = async (event, { conn}) => {
  try {
    const chatSettings = global.db.data.chats[event.id];
    if (!chatSettings ||!chatSettings.welcome) return;

    for (const participant of event.participants) {
      const username = '@' + participant.split('@')[0];
      let messageText = '';

      switch (event.action) {
        case 'add':
          messageText = `👋 ¡Bienvenido al grupo, ${username}!`;
          break;
        case 'remove':
          messageText = `👋 ${username} ha salido del grupo. ¡Hasta pronto!`;
          break;
        default:
          continue;
}

      await conn.sendMessage(event.id, {
        text: messageText,
        mentions: [participant]
});
}
} catch (error) {
    console.error('Error en welcome.js:', error);
}
};

handler.event = 'group-participants.update';
export default handler;
