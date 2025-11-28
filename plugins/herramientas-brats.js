import { sticker } from '../lib/sticker.js'
import axios from 'axios' 

let handler = async (m, { conn, text, command}) => {
  if (!text) {
    return m.reply(`Por favor, proporciona el texto para el sticker.\n\nEjemplo de uso:\n${command} Hola Mundo`);
}

  const encodedText = encodeURIComponent(text);
  const apiUrl = `https://shadow-apis.vercel.app/maker/brat?text=${encodedText}`;
  const successMessage = '🌵 Sticker Brat estático creado.';

  try {
    await m.react('⏳');

    const response = await fetch(apiUrl);
    if (!response.ok) {
      let errorText = `La API respondió con estado ${response.status}`;
      try {
        errorText += `: ${await response.text()}`;
} catch {}
      throw new Error(errorText);
}

    const buffer = await response.buffer();

    await conn.sendFile(
      m.chat,
      buffer,
      'sticker.webp',
      successMessage,
      m,
      false,
      { asSticker: true, mimetype: 'image/webp'}
);
} catch (error) {
    console.error('Error al crear el sticker:', error);
    await m.reply(`❌ Ocurrió un error al intentar crear el sticker: ${error.message}`);
}
};

handler.help = ['brat <texto>'];
handler.tags = ['sticker', 'herramientas'];
handler.command = ['brat'];

export default handler;
