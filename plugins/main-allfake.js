import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg

var handler = m => m
handler.all = async function (m) {

global.canalIdM = ["120363422855687721@newsletter"]
global.canalNombreM = ["𝖲𝗁𝖺𝖽𝗈𝗐 - 𝖡𝗈𝗍"]
global.channelRD = await getRandomChannel()

global.d = new Date(new Date + 3600000)
global.locale = 'es'
global.dia = d.toLocaleDateString(locale, { weekday: 'long' })
global.fecha = d.toLocaleDateString('es', { day: 'numeric', month: 'numeric', year: 'numeric' })
global.mes = d.toLocaleDateString('es', { month: 'long' })
global.año = d.toLocaleDateString('es', { year: 'numeric' })
global.tiempo = d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })
global.hora = d.toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

var canal = 'https://whatsapp.com/channel/0029Vb75ZmrC6ZvbQguXiZ2e'
var comunidad = 'https://chat.whatsapp.com/DlwujVOQQYwGlBJPhOseKB'
var git = 'https://github.com/dev-fedexyro'
var github = 'https://github.com/dev-fedexyro/Shadow-xyz'
var correo = 'federicoxyzz@gmail.com'
global.redes = [canal, comunidad, git, github, correo].getRandom()

let nombre = m.pushName || 'Anónimo'
let botname = global.botName || 'Sʜᴀᴅᴏᴡ - Bᴏᴛ'

global.packsticker = `
🌱 Usuario: ${nombre}
📚 Fecha: ${fecha}
⏱ Hora: ${hora}
⊱Made by fede Uchiha ✧
`

global.fkontak = {
key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" },
message: {
contactMessage: {
vcard: `BEGIN:VCARD
VERSION:3.0
N:Sy;Bot;;;
FN:y
item1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}
item1.X-ABLabel:Ponsel
END:VCARD`
}
},
participant: "0@s.whatsapp.net"
}

let thumb = await (await fetch(global.icono)).buffer()

global.rcanal = {
contextInfo: {
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterJid: channelRD.id,
serverMessageId: '',
newsletterName: channelRD.name
},
externalAdReply: {
title: botname,
body: global.dev,
mediaUrl: null,
description: null,
previewType: "PHOTO",
thumbnail: thumb,
sourceUrl: global.redes,
mediaType: 1,
renderLargerThumbnail: false
},
mentionedJid: null
}
}

}

export default handler

function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}

async function getRandomChannel() {
let randomIndex = Math.floor(Math.random() * global.canalIdM.length)
let id = global.canalIdM[randomIndex]
let name = global.canalNombreM[randomIndex]
return { id, name }
}
