import fetch from 'node-fetch';

let handler = async (m, { conn, command }) => {
    const apiUrl = 'https://sylphy.xyz/random/waifu';

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

        const imageBuffer = await response.buffer();

        await conn.sendFile(
            m.chat, 
            imageBuffer, 
            'anime.jpg', 
            '🌵 waifus random:', 
            m,
            false,
            { mimetype: 'image/jpeg' }
        );
        
    } catch (error) {
        console.error('Error al obtener la imagen:', error);
        await m.reply(`❌ Ocurrió un error: ${error.message}`);
    }
}

handler.help = ['waifu', 'waifus'];
handler.tags = ['herramientas'];
handler.command = ['waifu', 'waifus'];

export default handler;
