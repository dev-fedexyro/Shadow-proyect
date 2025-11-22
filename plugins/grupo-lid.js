import fetch from 'node-fetch'

async function makeFkontak() {
  try {
    const thumb2 = Buffer.from([]);
    return {
      key: {
        participants: '0@s.whatsapp.net',
        remoteJid: 'status@broadcast',
        fromMe: false,
        id: 'Halo'
},
      message: {
        locationMessage: {
          name: 'User Lid',
          jpegThumbnail: thumb2
}
},
      participant: '0@s.whatsapp.net'
};
} catch {
    return null;
}
}

async function resolveLidSafe(conn, jid) {
  try {
    
    if (typeof conn.onWhatsApp !== 'function') return null; 
    
    const res = await conn.onWhatsApp(jid); 
    
    const r = Array.isArray(res) ? res[0] : null;
    
    if (r && r.exists && r.lid) {
        return r.lid;
    }
    
    return null;
} catch (e) {
    console.error(`Error al obtener LID para ${jid}:`, e.message);
    return null;
}
}

const handler = async (m, { conn, text, participants, parseUserTargets }) => {
  try {
    if (!m.mentionedJid?.length && !m.quoted && !text?.trim()) {
      return conn.reply(m.chat, `
*🔍 Verificador de LID*

*Uso:*
• \`.lid @usuario\` — Menciona un usuario
• \`.lid\` (responde a un mensaje) — Obtiene el LID del usuario citado
• \`.lid 1234567890\` — Número directo
      `.trim(), m, rcanal);
    }

    const targets = await parseUserTargets(m, text, participants, conn); 

    if (!targets.length) {
      return conn.reply(m.chat, '❌ No se encontraron usuarios válidos para procesar.', m, rcanalx);
    }
    
    const targetJid = targets[0];
    const fkontak = await makeFkontak().catch(() => null);
    
    const lid = await resolveLidSafe(conn, targetJid);
    
    const targetNumber = targetJid.split('@')[0];
    const targetName = conn.getName(targetJid); 
    
    let response = `*👤 Usuario:* ${targetName}\n`;
    response += `*📞 Número:* ${targetNumber}\n`;
    response += `*🆔️ JID:* ${targetJid}\n\n`;
    
    if (lid) {
        response += `*✅ Linked ID (LID):* \`${lid}\``;
    } else {
        response += `*❌ Linked ID (LID):* No encontrado (o el usuario no tiene LID/no está en WhatsApp).`;
    }
    
    const mentionJids = [targetJid];
    
    try {
      const optsOk = (typeof rcanalr === 'object')? {...rcanalr, mentions: mentionJids}: { mentions: mentionJids};
      await conn.reply(m.chat, response.trim(), fkontak || m, optsOk);
    } catch (e) {
      const optsErr = (typeof rcanalx === 'object')? {...rcanalx, mentions: mentionJids}: { mentions: mentionJids};
      await conn.reply(m.chat, response.trim(), fkontak || m, optsErr);
    }

} catch (error) {
    console.error('❌ Error en dedgrupo-lid:', error);
    conn.reply(m.chat, '❌ Error al procesar: ' + error.message, m, rcanalx);
}
};

handler.help = ['lid'];
handler.tags = ['grupo'];
handler.command = /^(lid)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
