const handler = async (m, { isOwner, isAdmin, conn, participants, args, usedPrefix }) => {
  if (usedPrefix == 'a' || usedPrefix == 'A') return;
  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    return;
  }

  const mensaje = args.join(' ');
  const invocador = m.pushName || 'Sombra Invocadora';
  const pp = 'https://files.catbox.moe/32d81v.jpg'; // Imagen personalizada estilo Shadow Garden

  let teks = `╭───────𓆩🌑𓆪───────╮
┃    🌌 *Invocación del Shadow Garden* 🌑
┃       𝒃𝒚 𝙎𝙃𝘼𝘿𝙊𝙒 𝙂𝘼𝙍𝘿𝙀𝙉 uwu
╰───────𓆩🌑𓆪───────╯

🌑 *✉️ Mensaje lanzado desde las sombras:*  
➥ 🕯️ ${mensaje ? mensaje : '*Mensaje vacío... ¡envíame uno como un ritual sombrío uwu!* 🌑'}

*👥 Número de sombras invocadas en el jardín:*  
➥ ${participants.length} integrantes han respondido al llamado 🌌

🌑🌌🌑🌌🌑🌌🌑🌌🌑🌌🌑🌌`;

  for (const mem of participants) {
    teks += `\n➳ 🌑 @${mem.id.split('@')[0]}`;
  }

  teks += `

🌌🌑🌌🌑🌌🌑🌌🌑🌌🌑🌌🌑
╭──────────✦──────────╮
┃ 🌑 ƈօʍǟռɖօ: invocar/tagall
┃ 🕯️ 𝖾𝗇𝗏𝗂𝖺𝖽𝗈 𝖽𝖾𝗌𝖽𝖾 𝖊𝗹 Shadow Garden 
╰──────────✦──────────╯
──╯🌑🌑🌑🌑🌑🌑🌑🌑🌑🌑
> Creador fede`;

  await conn.sendFile(m.chat, pp, 'invocacion.jpg', teks, m, false, {
    mentions: participants.map(a => a.id)
  });
};

handler.help = ['tagall *<mensaje>*', 'invocar *<mensaje>*'];
handler.tags = ['grupo'];
handler.command = ['tagall', 'invocar'];
handler.admin = true;
handler.group = true;

export default handler;
