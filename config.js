import { watchFile, unwatchFile } from "fs"
import chalk from "chalk"
import { fileURLToPath } from "url"
import fs from "fs"

// ===
global.botNumber = "" //Ejemplo: 5491162424280

// ===

global.owner = ["5491124918653"]
global.suittag = [] 
global.prems = []

// ===

global.libreria = "Baileys"
global.vs = "Latest"
global.sessions = "Shadow/Principal"
global.jadi = "Shadow/Subbots"
global.ShadowJadibts = true

// ===

global.botname = "𝑺𝒉𝒂𝒅𝒐𝒘`𝑺 - 𝑩𝒐𝒕"
global.textbot = "© Տհαժօա - Ⴆօէ • 𝘍𝘦𝘥𝘦 𝘜𝘤𝘩𝘪𝘩𝘢"
global.dev = "𝐅𝐞𝐝𝐞 𝐔𝐜𝐡𝐢𝐡𝐚"
global.author = "𝘍𝘦𝘥𝘦 𝘜𝘤𝘩𝘪𝘩𝘢"
global.etiqueta = "𝘍𝘦𝘥𝘦 𝘜𝘤𝘩𝘪𝘩𝘢"
global.currency = "Yenes"
global.banner = "https://files.catbox.moe/"
global.icono = "https://files.catbox.moe/"
global.catalogo = fs.readFileSync('./storage/catalogo.png')

// ===

global.group = "https://chat.whatsapp.com/DlwujVOQQYwGlBJPhOseKB"
global.community = "https://chat.whatsapp.com/DlwujVOQQYwGlBJPhOseKB"
global.channel = "https://whatsapp.com/channel/0029Vb75ZmrC6ZvbQguXiZ2e"
global.github = "https://github.com/dev-fedexyro/Shadow-xyz"
global.gmail = "federicoxyzz@gmail.com"
global.ch = {
ch1: "120363406779062566@newsletter"
}

// ===


let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
unwatchFile(file)
console.log(chalk.redBright("Update 'config.js'"))
import(`${file}?update=${Date.now()}`)
})
