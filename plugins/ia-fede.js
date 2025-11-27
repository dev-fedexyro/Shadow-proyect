import fetch from 'node-fetch';

const handler = async (message, { conn, text}) => {
  try {

    if (!text && message.quoted?.text) {
      text = message.quoted.text;
}

    if (!text) {
      return message.reply('Decime algo o respondé a un mensaje, no soy adivino 😒');
}

    const lowerText = text.toLowerCase();
    const gayKeywords = ['eres gay', 'sos gay', 'eres gay?', 'sos gay?', 'eres gay o no', 'sos gay o no'];
    if (gayKeywords.some(k => lowerText.includes(k))) {
      return message.reply('😑 Ah ¿Gay yo? Nah... bueno, tal vez un poquito... pero solo por Yosue 😳✨');
}

    const creadorKeywords = ['quién es el creador', 'quien hizo el bot', 'quien lo creó', 'creador del bot'];
    if (creadorKeywords.some(k => lowerText.includes(k))) {
      return message.reply('👾 El creador del bot es *Fede Uchiha*, el genio detrás de *Shadow Ultra MD*, un bot en desarrollo.');
}

    const prompt = `Sos un bot con humor fresco, algo pendejo, que habla como si fuera parte del grupo. Te gusta joder, tirar frases graciosas, y responder con buena onda. Usá sarcasmo, memes y comentarios casuales. Si mencionan a Yosue, reaccioná con cariño y complicidad.`;

    const apiUrl = `https://delirius-apiofc.vercel.app/ia/gptprompt?text=${encodeURIComponent(
      text
)}&prompt=${encodeURIComponent(prompt)}`;

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Error en la API: ${response.statusText}`);

    const result = await response.json();
    if (!result.status) throw new Error('La API devolvió un error.');

    const reply = result.data || 'No sé qué decir... me dejaste sin palabras 😳';

    await conn.sendMessage(message.chat, {
      text: reply
}, { quoted: message});

} catch (err) {
    console.error(err);
    message.reply('Algo salió mal, pero tranqui, no fue tu culpa 😔');
}
};

handler.help = ['fede'];
handler.tags = ['ai'];
handler.command = ['fede'];

export default handler;
