import moment from "moment-timezone";
import fetch from "node-fetch";
const { prepareWAMessageMedia, generateWAMessageFromContent } = (await import("@whiskeysockets/baileys")).default;

let handler = async (m, { conn, usedPrefix, isOwner }) => {
  try {
    let tags = {
      info: 'ɪɴғᴏʀᴍᴀᴄɪᴏ́ɴ',
      anime: 'ᴀɴɪᴍᴇ & ᴡᴀɪғᴜs',
      buscador: 'ʙᴜsᴄᴀᴅᴏʀᴇs',
      downloader: 'ᴅᴇsᴄᴀʀɢᴀs',
      economy: 'ᴇᴄᴏɴᴏᴍɪ́ᴀ & ᴊᴜᴇɢᴏs',
      fun: 'ᴊᴜᴇɢᴏs ᴅɪᴠᴇʀᴛɪᴅᴏs',
      group: 'ғᴜɴᴄɪᴏɴᴇs ᴅᴇ ɢʀᴜᴘᴏ',
      ai: 'ɪɴᴛᴇʟɪɢᴇɴᴄɪᴀ ᴀʀᴛғɪᴄɪᴀʟ',
      game: 'ᴊᴜᴇɢᴏs ᴄʟᴀ́sɪᴄᴏs',
      serbot: 'sᴜʙ-ʙᴏᴛs',
      main: 'ᴄᴏᴍᴀɴᴅᴏs ᴘʀɪɴᴄɪᴘᴀʟᴇs',
      nable: 'ᴀᴄᴛɪᴠᴀʀ / ᴅᴇsᴀᴄᴛɪᴠᴀʀ',
      nsfw: 'ɴsғᴡ',
      owner: 'ᴅᴜᴇñᴏ / ᴀᴅᴍɪɴ',
      sticker: 'sᴛɪᴄᴋᴇʀs & ʟᴏɢᴏs',
      herramientas: 'ʜᴇʀʀᴀᴍɪᴇɴᴛᴀs'
    }

    const defaultMenu = {
      before: `
───────── ⭒ ─────────

Hola %name, soy *Shadow-Bot*.
%greeting, estoy aquí para ayudarte.

📚 Motor: *Baileys MD*
👤 Bot: *%botName*

⏱ Tiempo activo: *%uptime*
👥 Usuarios registrados: *%totalreg*%readmore

*▪︎──LISTA DE COMANDOS──▪︎*
`.trim(),
      
      header: `╭── ⭒ *%category* |  %firstCmd %firstLimit %firstPremium`.trim(),
    
      body: '│ ➩ %cmd %islimit %isPremium',
      footer: '╰──────────\n',
      after: ''
    }

    let uptimeSec = process.uptime();
    let hours = Math.floor(uptimeSec / 3600);
    let minutes = Math.floor((uptimeSec % 3600) / 60);
    let seconds = Math.floor(uptimeSec % 60);
    let uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

    const tz = "America/Tegucigalpa";
    const now = moment.tz(tz);
    const hour = now.hour();

    let saludo = "👋 ¡Hola!";
    if (hour >= 5 && hour < 12) saludo = "☀️ ¡Buenos días!";
    else if (hour >= 12 && hour < 18) saludo = "🌅 ¡Buenas tardes!";
    else saludo = "🌙 ¡Buenas noches!";

    let name = conn.getName(m.sender);
    let totalreg = Object.keys(global.db.data.users).length;
    let readmore = '\n\n'; 
    let botName = global.botname || "Shadow Ultra MD"; 
    
    const imageUrl = "https://files.catbox.moe/cdxpz2.jpg"; 
    
    let mediaMessage = null;
    let thumbnailBuffer = null;
    try {
      const res = await fetch(imageUrl);
      thumbnailBuffer = await res.buffer();
      mediaMessage = await prepareWAMessageMedia({ image: thumbnailBuffer }, { upload: conn.waUploadToServer });
    } catch (e) {
      
    }
    
    let menu = {};
    for (let plugin of Object.values(global.plugins)) {
      if (!plugin || !plugin.help) continue;
      let taglist = plugin.tags || [];
      for (let tag of taglist) {
        if (!menu[tag]) menu[tag] = [];
        if (tags[tag]) menu[tag].push(plugin);
      }
    }

    let text = defaultMenu.before
        .replace(/%uptime/g, uptimeStr)
        .replace(/%greeting/g, saludo)
        .replace(/%name/g, name)
        .replace(/%totalreg/g, totalreg)
        .replace(/%readmore/g, readmore)
        .replace(/%botName/g, botName);


    for (let tag in tags) {
      if (menu[tag] && menu[tag].length > 0) {
        
        let plugins = menu[tag].flatMap(p => 
            p.help && p.tags && p.tags.includes(tag) ? p.help.map(cmd => ({ cmd, plugin: p })) : []
        );
        
        if (plugins.length > 0) {
            const firstPlugin = plugins[0].plugin;
            const firstCmd = plugins[0].cmd;
            const firstLimit = firstPlugin.limit ? 'Ⓛ' : '';
            const firstPremium = firstPlugin.premium || firstPlugin.isPrivate ? 'Ⓟ' : '';

            text += defaultMenu.header
                .replace(/%category/g, tags[tag])
                .replace(/%firstCmd/g, usedPrefix + firstCmd)
                .replace(/%firstLimit/g, firstLimit)
                .replace(/%firstPremium/g, firstPremium);
            text += '\n';

            for (let i = 1; i < plugins.length; i++) {
                const plugin = plugins[i].plugin;
                const cmd = plugins[i].cmd;
                let islimit = plugin.limit ? 'Ⓛ' : '';
                let isPremium = plugin.premium || plugin.isPrivate ? 'Ⓟ' : '';
                
                text += defaultMenu.body
                    .replace(/%cmd/g, usedPrefix + cmd)
                    .replace(/%islimit/g, islimit)
                    .replace(/%isPremium/g, isPremium) + '\n';
            }
        }
        
        text += defaultMenu.footer;
      }
    }

    text += defaultMenu.after;
    
    await conn.sendMessage(m.chat, { react: { text: '🌑', key: m.key } });

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: { text: text }, 
            footer: { text: " " },
            header: {
              hasMediaAttachment: !!mediaMessage,
              imageMessage: mediaMessage ? mediaMessage.imageMessage : null 
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "cta_url",
                  buttonParamsJson: JSON.stringify({
                    display_text: "🌱 Canal Oficial",
                    url: "https://whatsapp.com/channel/0029VbBG4i2GE56rSgXsqw2W",
                    merchant_url: "https://whatsapp.com/channel/0029VbBG4i2GE56rSgXsqw2W"
                  })
                }
              ],
              messageParamsJson: ""
            },
          }
        }
      }
    }, { quoted: m });

    await conn.relayMessage(m.chat, msg.message, {});

  } catch (e) {
    conn.reply(m.chat, "🌿 Error al cargar el menú.", m);
  }
};

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'help', 'menú']

export default handler;
