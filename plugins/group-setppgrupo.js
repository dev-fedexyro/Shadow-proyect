let handler = async (m, { conn}) => {

  if (!m.quoted ||!/image/.test(m.quoted.mimetype || '')) {
    return m.reply('\`\`\`🌱 Por favor, responde a una imagen para actualizar la foto del grupo.\`\`\`');
}

  try {
    const media = await m.quoted.download();
    await conn.updateProfilePicture(m.chat, media);
    await m.reply('\`\`\`✅ La foto del grupo se actualizó correctamente.\`\`\`');
} catch (error) {
    console.error('Error al actualizar la foto del grupo:', error);
    await m.reply('\`\`\`🍂 Ocurrió un error al actualizar la foto del grupo. Asegúrate de que tengo permisos de administrador y que la imagen es válida.\`\`\`');
}
};

handler.help = ['setppgc', 'setppgrupo'];
handler.tags = ['group'];
handler.command = ['setppgc', 'setppgrupo', 'setppgroup'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
