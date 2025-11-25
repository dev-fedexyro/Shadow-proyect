let handler = async (m, { conn, usedPrefix, command }) => {
    let bot = conn.user.jid;
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || "";
    if (/image/.test(mime)) {
        let img = await q.download();
        if (!img) return m.reply("Imagen no encontrada");
        await conn.updateProfilePicture(bot, img);
        conn.reply(m.chat, "\`\`\`🌱 Foto de perfil del bot cambiada (exitosamente)\`\`\`", m);
    } else return m.reply(`\`\`\`🌵 Por favor a una imagen con el comando ${usedPrefix + command}\`\`\``);
};

handler.help = ["setppbot", "setpp"];
handler.tags = ["owner"];
handler.command = ["setppbot", "setpp"]
handler.mods = true;

export default handler;
