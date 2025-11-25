import * as cheerio from "cheerio";
import { basename, extname } from "path";
import mime from "mime-types";

async function mediafire(url) {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
        throw new Error("URL de MediaFire no proporcionada.");
    }

    const response = await fetch(trimmedUrl);
    if (!response.ok) {
        throw new Error(`Error al obtener la página: ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $("meta[property='og:title']").attr("content")?.trim() || "Unknown";

    const dlAnchor = $("a.popsok[href^='https://download']").get(0) || $("a.popsok:not([href^='javascript'])").get(0);

    if (!dlAnchor) {
        throw new Error("No se pudo encontrar la URL de descarga directa.");
    }
    
    const dl = $(dlAnchor).attr("href")?.trim();
    if (!dl) {
         throw new Error("La URL de descarga está vacía o es inválida.");
    }

    const sizeMatch = /Download\s*\(([\d.]+\s*[KMGT]?B)\)/i.exec(html);
    const size = sizeMatch?.[1] || "Unknown";

    return { 
        name: title, 
        filename: basename(dl), 
        type: extname(dl), 
        size, 
        download: dl, 
        link: trimmedUrl 
    };
}

let handler = async (m, { conn, args, command }) => {
    if (!args[0]) {
        return m.reply(`*Por favor, Promociona un url de mediafire...`);
    }

    try {
        const data = await mediafire(args[0]);
        
        const mimetype = mime.lookup(data.filename) || 'application/octet-stream';
        
        await conn.sendMessage(m.chat, { 
            document: { url: data.download }, 
            mimetype, 
            fileName: data.filename,
            caption: `*Archivo:* ${data.name}\n*Tamaño:* ${data.size}\n*URL:* ${data.link}`
        }, { quoted: m });

    } catch (e) {
        console.error("Error en el handler de MediaFire:", e);
        m.reply(`⚠️ *Error al descargar de MediaFire:*\n\n${e.message}`);
    }
};

handler.help = ['mediafire <url>'];
handler.command = ['mediafire', 'mf'];
handler.tags = ['downloader'];

export default handler;
