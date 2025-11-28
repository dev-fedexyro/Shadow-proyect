import fetch from 'node-fetch';

let handler = async (m, { conn, command }) => {
    const apiUrl = 'https://shadow-apis.vercel.app/random/ba';

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

        await conn.sendFile(m.chat, response, 'anime.jpg', '🌵 imagen random:', m);
        
    } catch (error) {
        console.error('Error al obtener la imagen:', error);
        await m.reply(`❌ Ocurrió un error: ${error.message}`);
    }
}

handler.help = ['anime'];
handler.tags = ['herramientas', 'imagen'];
handler.command = ['anime'];

export default handler;
