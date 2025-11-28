import fetch from 'node-fetch';

let handler = async (m, { conn, text, command }) => {
    if (!text) {
        return m.reply(`Por favor, proporciona el texto para el sticker.\n\nEjemplo de uso:\n${command} Hola Mundo`);
    }

    let apiUrl;
    let successMessage;
    let mimeType;

    const encodedText = encodeURIComponent(text);

    if (command === 'brat') {
        apiUrl = `https://shadow-apis.vercel.app/maker/brat?text=${encodedText}`;
        successMessage = '🌵 Sticker Brat estático creado.';
        mimeType = 'image/webp';
    } else if (command === 'bratvid') {
        apiUrl = `https://shadow-apis.vercel.app/maker/bratvid?text=${encodedText}`;
        successMessage = '🌵 Sticker Brat de video creado.';
        mimeType = 'video/mp4';
    } else {
        return;
    }

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
            { asSticker: true, mimetype: mimeType }
        );
        
    } catch (error) {
        console.error('Error al crear el sticker:', error);
        await m.reply(`❌ Ocurrió un error al intentar crear el sticker: ${error.message}`);
    }
}

handler.help = ['brat <texto>', 'bratvid <texto>'];
handler.tags = ['sticker', 'herramientas'];
handler.command = ['brat', 'bratvid'];

export default handler;
