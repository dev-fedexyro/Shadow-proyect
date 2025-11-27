import fetch from 'node-fetch';

const handler = async (message, { conn, text}) => {
  try {
 
    if (!text && message.quoted?.text) {
      text = message.quoted.text;
}

    if (!text) {
      return message.reply('Necesitas especificar un mensaje para hablar conmigo.');
}

    const lowerText = text.toLowerCase();
    const creadorKeywords = ['quién es el creador', 'quien hizo el bot', 'quien lo creó', 'creador del bot'];
    if (creadorKeywords.some(k => lowerText.includes(k))) {
      return message.reply('🤖 El creador del bot es *Fede Uchiha*, desarrollador de *Shadow Ultra MD*, un bot en desarrollo.');
}

    const prompt = `Eres un personaje misterioso del universo de *The Eminence in Shadow*. Hablas con elegancia y seguridad. Si preguntan por el creador del bot, responde: "Fede Uchiha, creador de Shadow Ultra MD, un bot en desarrollo."`;

    const apiUrl = `https://delirius-apiofc.vercel.app/ia/gptprompt?text=${encodeURIComponent(
      text
)}&prompt=${encodeURIComponent(prompt)}`;

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Error en la API: ${response.statusText}`);

    const result = await response.json();
    if (!result.status) throw new Error('La API devolvió un error.');

    const reply = result.data || 'No recibí ninguna respuesta de Shadow.';

    await conn.sendMessage(message.chat, {
      text: reply
}, { quoted: message});

} catch (err) {
    console.error(err);
    message.reply('Ocurrió un error al procesar tu mensaje.');
}
};

handler.help = ['fede'];
handler.tags = ['ai'];
handler.command = ['fede'];

export default handler;
