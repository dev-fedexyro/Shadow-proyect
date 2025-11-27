let handler = async (m, { conn, participants, usedPrefix, command}) => {

  if (!m.isGroup) return conn.reply(m.chat, '❗ Este comando solo puede usarse en grupos.', m)

  const mentionedJid = m.mentionedJid && m.mentionedJid[0]
  const quotedJid = m.quoted? m.quoted.sender: null
  const user = mentionedJid || quotedJid

  if (!user) {
    return conn.reply(m.chat, `🌱 Debes mencionar o responder al mensaje de un usuario para expulsarlo.`, m)
}

  try {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const groupOwner = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
    const botOwner = global.owner?.[0]?.[0] + '@s.whatsapp.net'

    if (user === conn.user.jid) {
      return conn.reply(m.chat, `🌿 No puedo expulsarme a mí mismo del grupo.`, m)
}

    if (user === groupOwner) {
      return conn.reply(m.chat, `🌵 No puedo expulsar al propietario del grupo.`, m)
}

    if (user === botOwner) {
      return conn.reply(m.chat, `🍒 No puedo expulsar al propietario del bot.`, m)
}

    if (!participants.some(p => p.jid === user)) {
      return conn.reply(m.chat, `❌ El usuario no se encuentra en este grupo.`, m)
}

    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
    await conn.reply(m.chat, `✅ Usuario expulsado correctamente.`, m)
} catch (e) {
    console.error(e)
    conn.reply(
      m.chat,
      `⚠️ Ocurrió un error al intentar expulsar al usuario.\n\nUsa *${usedPrefix}report* para informar del problema.\n\n${e.message}`,
      m
)
}
}

handler.help = ['kick @usuario']
handler.tags = ['group']
handler.command = ['kick', 'echar', 'hechar', 'sacar', 'ban']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
