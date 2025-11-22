import { fileURLToPath} from 'url'
import { watch} from 'fs'

const videoUrls = [
    'https://cdn.russellxz.click/14cf14e9.mp4',
    'https://cdn.russellxz.click/17b9d337.mp4',
    'https://cdn.russellxz.click/7e2cb594.mp4'
];

const handler = async (m, { conn, command}) => {
    if (command === 'shadow') {
        const caption = '\`\`\`👻 Vídeo de Shadow:\`\`\`';
        const randomUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)];

        try {
            await conn.sendMessage(m.chat, {
                video: { url: randomUrl},
                caption: caption,
                mimetype: 'video/mp4'
}, { quoted: m});
} catch (error) {
            console.error('Error al enviar el video de Shadow:', error);
            m.reply('❌ Lo siento, hubo un error al enviar el video.');
}
}
};

handler.help = ['shadow'];
handler.tags = ['herramientas'];
handler.command = ['shadow'];

export default handler;
