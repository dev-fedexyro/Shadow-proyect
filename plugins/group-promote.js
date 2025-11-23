var handler = async (m, { conn, usedPrefix, command, text, groupMetadata, isAdmin }) => {
  let mentionedJid = await m.mentionedJid
  let user = mentionedJid && mentionedJid.length 
    ? mentionedJid[0] 
    : m.quoted && await m.quoted.sender 
      ? await m.quoted.sender 
      : null

  if (!user) return conn.reply(m.chat, `\`\`\`☕ Debes mencionar o responder a un usuario.\`\`\``, m)

  try {
    const groupInfo = await conn.groupMetadata(m.chat)
    const ownerGroup = groupInfo.owner || m.chat.split('-')[0] + '@s.whatsapp.net'

    if (command === 'promote' || command === 'promover') {
      if (user === ownerGroup || groupInfo.participants.some(p => p.id === user && p.admin))
        return conn.reply(m.chat, '> El usuario mencionado ya tiene privilegios de administrador.', m)

      await conn.groupParticipantsUpdate(m.chat, [user], 'promote')
      await conn.reply(m.chat, `\`\`\`🌵 Fue agregado como admin del grupo con éxito.\`\`\``, m)
    }

    if (command === 'demote' || command === 'quitaradmin') {
      if (user === ownerGroup)
        return conn.reply(m.chat, '> No puedes quitar el admin al dueño del grupo.', m)

      if (!groupInfo.participants.some(p => p.id === user && p.admin))
        return conn.reply(m.chat, '> El usuario mencionado no es administrador.', m)

      await conn.groupParticipantsUpdate(m.chat, [user], 'demote')
      await conn.reply(m.chat, `\`\`\`🌱 El usuario fue removido de la administración del grupo.\`\`\``, m)
    }

  } catch (e) {
    conn.reply(m.chat, `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}`, m)
  }
}

handler.help = ['promote', 'demote']
handler.tags = ['group']
handler.command = ['promote', 'promover', 'demote', 'quitaradmin']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
