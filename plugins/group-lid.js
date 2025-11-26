let handler = async (m, { conn, command, args, text }) => {
    let targetId;
    let title = 'Obtener JID/LID';
    let targetLID = 'N/D';

    if (m.quoted) {
        targetId = m.quoted.sender;
        targetLID = m.quoted.participant.lid || 'N/D';
    } 
    else if (text) {
        const mentionMatch = text.match(/@(\d+)/);
        if (mentionMatch) {
            targetId = mentionMatch[1] + '@s.whatsapp.net';
        } 
        else {
            let number = text.replace(/[^0-9]/g, '');
            if (number.length > 7) {
                targetId = number + '@s.whatsapp.net';
            }
        }
    } 
    
    if (!targetId) {
        targetId = m.sender;
        title = 'Tu JID/LID';
    }

    let jidResult = targetId;
    let numberClean = jidResult.split('@')[0];
    
    if (targetLID === 'N/D' && jidResult === m.sender) {
        const lidMatch = m.sender.match(/(\d+)@lid/);
        if (lidMatch) {
             targetLID = lidMatch[1] + '@lid';
        }
    }

    let fkontak = { 
        "key": { 
            "participants":"0@s.whatsapp.net", 
            "remoteJid": "status@broadcast", 
            "fromMe": false, 
            "id": "Halo" 
        }, 
        "message": { 
            "contactMessage": { 
                "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
            }
        }, 
        "participant": "0@s.whatsapp.net" 
    }

    let icons = 'https://files.catbox.moe/p0fk5h.jpg'; 
    let md = 'https://github.com/dev-fedexyzz';

    const caption = `
👤 *DATOS DEL USUARIO* 🕵️
═════════════════
💚 *Número de WhatsApp:*
\`+${numberClean}\`

🔑 *JID (ID de WhatsApp):*
\`${jidResult}\`

🔗 *LID (ID Vinculado/Server ID):*
\`${targetLID}\`
═════════════════
`;
    
    let pp;
    try {
        pp = await conn.profilePictureUrl(jidResult, 'image');
    } catch {
        pp = icons;
    }

    await conn.sendMessage(m.chat, { 
        text: caption, 
        contextInfo: {
            mentionedJid: conn.parseMention(caption),
            externalAdReply: {
                title: title,
                body: `Usuario: ${numberClean}`,
                thumbnailUrl: pp,
                sourceUrl: md,
                mediaType: 1,
                showAdAttribution: false,
                renderLargerThumbnail: false
            }
        }
    }, { quoted: fkontak });
}

handler.tags = ['group'];
handler.help = ['lid', 'lidnum', 'lid <@mención|número>'];
handler.command = ['lid', 'lidnum'];

export default handler;
