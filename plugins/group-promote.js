var handler = async (m, { conn, usedPrefix, command, text}) => {
  const mentionedJid = m.mentionedJid?.[0] || m.quoted?.sender;

  if (!mentionedJid) {
    return conn.reply(m.chat, '🌱 *Debes mencionar o responder a un usuario.*', m);
}

  try {
    const groupInfo = await conn.groupMetadata(m.chat);
    const ownerGroup = groupInfo.owner || m.chat.split('-')[0] + '@s.whatsapp.net';
    const participant = groupInfo.participants.find(p => p.id === mentionedJid);
    const isTargetAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';

    if (command === 'promote' || command === 'promover') {
      if (mentionedJid === ownerGroup || isTargetAdmin) {
        return conn.reply(m.chat, '⚠️ *El usuario ya es administrador o es el dueño del grupo.*', m);
}

      await conn.groupParticipantsUpdate(m.chat, [mentionedJid], 'promote');
      conn.reply(m.chat, '🌵 *Fue agregado como admin del grupo con éxito.*', m);
}

    if (command === 'demote' || command === 'quitaradmin') {
      if (mentionedJid === ownerGroup) {
        return conn.reply(m.chat, '🌑 *No puedes quitar el admin al dueño del grupo.*', m);
}

      if (!isTargetAdmin) {
        return conn.reply(m.chat, '🌑 *El usuario mencionado no es administrador.*', m);
}

      await conn.groupParticipantsUpdate(m.chat, [mentionedJid], 'demote');
      conn.reply(m.chat, '🌱 *El usuario fue removido de la administración del grupo.*', m);
}

} catch (e) {
    conn.reply(m.chat, `⚠️ *Se ha producido un error.*\nUsa *${usedPrefix}report* para informarlo.\n\n${e.message}`, m);
}
};

handler.help = ['promote', 'demote', 'promover', 'quitaradmin'];
handler.tags = ['group'];
handler.command = ['promote', 'demote', 'promover', 'quitaradmin'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
