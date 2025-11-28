import Jimp from 'jimp'
import axios from 'axios'
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = (await import("@whiskeysockets/baileys")).default;

let handler = async (m, { conn, text }) => {

  if (!text) {
    return conn.reply(m.chat, `🖼️ Responde a una imagen o sticker para reducirlo o envíala con el comando.\n\n📌 Ejemplo: *.reduce 300×300*`, m, rcanal);
  }

  let input = text.trim().split(/[x×]/i);
  if (input.length !== 2 || isNaN(input[0]) || isNaN(input[1])) {
    return m.reply('❌ Formato incorrecto.\nUsa: *.reduce 300×300*');
  }

  let width = parseInt(input[0]);
  let height = parseInt(input[1]);

  let media;
  if (m.quoted && /image|sticker/.test(m.quoted.mtype)) {
    media = await m.quoted.download();
  } else if (/image|sticker/.test(m.mtype)) {
    media = await m.download();
  } else {
    return conn.reply(m.chat, `🖼️ Responde a una imagen o sticker para reducirlo o envíala con el comando.\n\n📌 Ejemplo: *.reduce 300×300*`, m, rcanal);
  }

  try {
    let image = await Jimp.read(media);

    image.resize(width, height);

    let buffer = await image.getBufferAsync(Jimp.MIME_JPEG);


    let formData = new FormData();
    formData.append('source', new Blob([buffer], { type: 'image/jpeg' }));
    formData.append('key', '6d207e02198a847aa98d0a2a901485a5');
    formData.append('action', 'upload');

    try {
      let uploadRes = await axios.post('https://freeimage.host/api/1/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      let uploadedUrl = uploadRes.data.image.url;

      let media = await prepareWAMessageMedia({ image: buffer }, { upload: conn.waUploadToServer });
      const buttons = [{
        name: "cta_copy",
        buttonParamsJson: JSON.stringify({
          display_text: "乂 C O P I A R 乂 ",
          copy_code: uploadedUrl
        })
      }];
      const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.fromObject({
                text: ` 乂  *L I N K  - E N L A C E * 乂: ${uploadedUrl}`
              }),
              footer: proto.Message.InteractiveMessage.Footer.fromObject({
                text: `*${width}×${height}*`
              }),
              header: proto.Message.InteractiveMessage.Header.fromObject({
                title: "乂 I M A G E N – R E D U C I D A 乂",
                hasMediaAttachment: true,
                imageMessage: media.imageMessage
              }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                buttons
              })
            })
          }
        }
      }, { quoted: m });
      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    } catch (uploadError) {
      console.error('Error uploading:', uploadError);
      await conn.sendFile(m.chat, buffer, 'reducida.jpg', ` Imagen reducida a *${width}×${height}*\n\n⚠️ Error al subir al servidor.`, m, rcanal);
    }
  } catch (e) {
    console.error(e);
    m.reply('⚠️ Ocurrió un error al procesar la imagen.');
  }
};

handler.command = handler.help = ['reduce', 'reducir'];
handler.tags = ['herramientas'];
export default handler;
