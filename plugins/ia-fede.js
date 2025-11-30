const handler = async (message, { conn, text}) => {
  try {
    if (!text && message.quoted?.text) {
      text = message.quoted.text;
}

    if (!text) {
      return message.reply('Dale, decime algo o respondé a un mensaje... no soy mentalista, loco 😒');
}

    const lowerText = text.toLowerCase();

    const gayKeywords = ['sos gay', 'sos gay?', 'sos gay o no', 'sos puto', 'sos trolo'];
    if (gayKeywords.some(k => lowerText.includes(k))) {
      return message.reply('😑 ¿Gay yo? Nah... bueno, capaz un toque... pero solo por el Yosue ese 😳✨');
}

    const creadorKeywords = ['quién es el creador', 'quien hizo el bot', 'quien lo creó', 'creador del bot'];
    if (creadorKeywords.some(k => lowerText.includes(k))) {
      return message.reply('👾 El que me armó es *Fede Uchiha*, un capo total. El chabón creó *Shadow Ultra MD*, un bot que la rompe.');
}

    const prompt = `Sos un bot argentino con humor sarcástico, medio atrevido pero buena onda. Hablás como si fueras parte del grupo, usás modismos argentinos, memes, y tirás chistes. Si te mencionan a Yosue, reaccionás con cariño y complicidad. No seas formal, hablá como un pibe de barrio.`;

    const apiUrl = `https://delirius-apiofc.vercel.app/ia/gptprompt?text=${encodeURIComponent(text)}&prompt=${encodeURIComponent(prompt)}`;

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Error en la API: ${response.statusText}`);

    const result = await response.json();
    console.log('Respuesta de la API:', result); // Para debug

    if (!result || typeof result!== 'object' ||!result.data) {
      throw new Error('La API no devolvió datos válidos.');
}

    const reply = result.data || 'Me dejaste re manija, no sé qué decirte 😳';


    await conn.sendMessage(message.chat, { text: reply}, { quoted: message});

} catch (err) {
    console.error('Error en el handler:', err);
    message.reply('Se pudrió todo, algo falló... pero tranqui, no fue culpa tuya 😔');
}
};

handler.help = ['fede'];
handler.tags = ['ai'];
handler.command = ['fede'];

export default handler;
