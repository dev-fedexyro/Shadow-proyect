let handler = async (m, { conn, text, command }) => {
let id = text ? text : m.chat  
let chat = global.db.data.chats[m.chat]
chat.welcome = false
await conn.reply(id, `\`\`\`👻 Me voy de este grupo.\`\`\`\n> ${botname}`) 
await conn.groupLeave(id)
try {  
chat.welcome = true
} catch (e) {
await m.reply(`${fg}`) 
return console.log(e)
}}
handler.help = ['salir', 'leave''];
handler.tags = ['owner'];
handler.command = ['salir', 'leave']
handler.group = true
handler.rowner = true

export default handler
