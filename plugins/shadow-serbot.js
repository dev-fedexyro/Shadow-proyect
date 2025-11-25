const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion} = (await import("@whiskeysockets/baileys"));
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util' 
import * as ws from 'ws'
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""

const SESSION_DURATION_MS = 5 * 24 * 60 * 60 * 1000
const MAX_RECONNECT_ATTEMPTS = 5
const INITIAL_REATTEMPT_DELAY_MS = 15 * 1000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ShadowJBOptions = {}

if (!(global.conns instanceof Array)) global.conns = []

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    let time = global.db.data.users[m.sender].Subs + 10000
    if (new Date - global.db.data.users[m.sender].Subs < 10000) return conn.reply(m.chat, `${emoji} Debes esperar ${msToTime(time - new Date())} para volver a vincular un *Sub-Bot.*`, m, global.rcanal)
    
    const activeSubBots = global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED)
    const subBotsCount = activeSubBots.length
    
    if (subBotsCount >= 100) {
        return conn.reply(m.chat, `${emoji2} No se han encontrado espacios para *Sub-Bots* disponibles (Límite: 100).`, m, global.rcanal)
    }
    
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let id = `${who.split`@`[0]}`
    let pathShadowJadiBot = path.join(`./${jadi}/`, id)
    
    if (!fs.existsSync(pathShadowJadiBot)){
        fs.mkdirSync(pathShadowJadiBot, { recursive: true })
    }

    ShadowJBOptions.pathShadowJadiBot = pathShadowJadiBot
    ShadowJBOptions.m = m
    ShadowJBOptions.conn = conn
    ShadowJBOptions.args = args
    ShadowJBOptions.usedPrefix = usedPrefix
    ShadowJBOptions.command = command
    ShadowJBOptions.fromCommand = true
    
    await ShadowJadiBot(ShadowJBOptions)
    global.db.data.users[m.sender].Subs = new Date * 1
} 

handler.help = ['code', 'codebot']
handler.tags = ['serbot']
handler.command = ['code', 'codebot']
export default handler 

const reconnectAttemptsMap = new Map();

export async function ShadowJadiBot(options) {
    let { pathShadowJadiBot, m, conn, args, usedPrefix, command } = options
    const mcode = true 
    let txtCodeMessage 
    let userJid = `${path.basename(pathShadowJadiBot)}@s.whatsapp.net`
    let reconnectAttempts = reconnectAttemptsMap.get(userJid) || 0;
    
    if (mcode) {
        args[0] = args[0] ? args[0].replace(/^--code$|^code$/, "").trim() : args[0]
        if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
        if (args[0] == "") args[0] = undefined
    }
    
    const pathCreds = path.join(pathShadowJadiBot, "creds.json")
    if (!fs.existsSync(pathShadowJadiBot)){
        fs.mkdirSync(pathShadowJadiBot, { recursive: true })
    }

    if (args[0] && args[0] != undefined) {
        try {
            fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t'))
        } catch {
            conn.reply(m.chat, `${emoji} Use correctamente el comando » ${usedPrefix + command}`, m)
            return
        }
    }
    
    const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
    exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
        const drmer = Buffer.from(drm1 + drm2, `base64`)

        let { version, isLatest } = await fetchLatestBaileysVersion()
        const msgRetry = (MessageRetryMap) => { }
        const msgRetryCache = new NodeCache()
        const { state, saveState, saveCreds } = await useMultiFileAuthState(pathShadowJadiBot)

        const connectionOptions = {
            logger: pino({ level: "fatal" }),
            printQRInTerminal: false,
            auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
            msgRetry,
            msgRetryCache,
            browser: ['Ubuntu', 'Chrome', '110.0.5585.95'], 
            version: version,
            generateHighQualityLinkPreview: true
        };

        let sock = makeWASocket(connectionOptions)
        sock.isInit = false
        let isInit = true
        
        const cleanSession = (jid, shouldRemoveDir = false) => {
            try { sock.ws.close() } catch {}
            sock.ev.removeAllListeners()
            let i = global.conns.indexOf(sock)                
            if (i >= 0) {
                delete global.conns[i]
                global.conns.splice(i, 1)
            }
            reconnectAttemptsMap.delete(jid);
            if (shouldRemoveDir && fs.existsSync(pathShadowJadiBot)) {
                fs.rmdirSync(pathShadowJadiBot, { recursive: true });
            }
        };


        async function connectionUpdate(update) {
            const { connection, lastDisconnect, isNewLogin, qr } = update
            
            if (qr || (connection === 'connecting' && !sock.authState.creds.registered)) { 
                
                if (global.conns.some(c => c.user?.jid === sock.user?.jid) && connection !== 'connecting') {
                } else if (!sock.authState.creds.registered || connection === 'connecting') {
                    try {
                        let rawCode = await sock.requestPairingCode((m.sender.split`@`[0]))
                        let formattedCode = rawCode.match(/.{1,4}/g)?.join("-")
                        
                        const pairingCodeMessage = `
\`\`\`${formattedCode}\`\`\`
`;
                        if (txtCodeMessage && txtCodeMessage.key) {
                            await conn.sendMessage(m.chat, { delete: txtCodeMessage.key });
                        }
                        
                        txtCodeMessage = await conn.sendMessage(m.chat, { 
                            text: pairingCodeMessage.trim()
                        }, { quoted: m });
                        
                        console.log(chalk.bold.greenBright(`Código de Vinculación para +${path.basename(pathShadowJadiBot)}: ${rawCode}`));
                    } catch (e) {
                        console.error(chalk.bold.red(`Error al solicitar pairing code para +${path.basename(pathShadowJadiBot)}: ${e}`));
                    }
                }
            }

            if (txtCodeMessage && txtCodeMessage.key && connection !== 'open' && connection !== 'connecting') {
                setTimeout(() => { conn.sendMessage(m.chat, { delete: txtCodeMessage.key }).catch(() => {})}, 45000)
            }

            const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
            if (connection === 'close') {
                reconnectAttemptsMap.set(userJid, reconnectAttempts + 1);
                
                const shouldReconnect = reason !== DisconnectReason.loggedOut && 
                                        reason !== 405 && 
                                        reason !== 401 && 
                                        reason !== 403;
                                        
                console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La conexión (+${path.basename(pathShadowJadiBot)}) fue cerrada. Razón: ${reason}.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`));
                
                if (shouldReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    const delay = INITIAL_REATTEMPT_DELAY_MS * (reconnectAttempts + 1);
                    console.log(chalk.bold.yellowBright(`\n[ 🔄 RECONEXIÓN ] Intentando reconectar (+${path.basename(pathShadowJadiBot)}) en ${delay / 1000}s. Intento: ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS}`));
                    
                    setTimeout(async () => {
                        await creloadHandler(true).catch(console.error);
                    }, delay);
                } else {
                    console.log(chalk.bold.redBright(`\n[ ❌ CIERRE TERMINAL ] Sesión (+${path.basename(pathShadowJadiBot)}) cerrada definitivamente. Borrando datos...`));
                    try {
                        if (options.fromCommand) m?.chat ? await conn.sendMessage(userJid, {text : '*[ 🌾 SESIÓN CERRADA PERMANENTEMENTE ]*\n\n> *La sesión ha caducado, fue cerrada manualmente o ha fallado demasiados intentos de reconexión. Intente vincular el Sub-Bot nuevamente con el comando.* \`\`\`#code\`\`\`' }, { quoted: m || null }) : ""
                    } catch (error) {
                        console.error(chalk.bold.yellow(`Error al enviar mensaje de cierre a: +${path.basename(pathShadowJadiBot)}`))
                    }
                    cleanSession(userJid, true);
                }
            }

            if (global.db.data == null) loadDatabase()
            
            if (connection == `open`) {
                reconnectAttemptsMap.set(userJid, 0); 
                
                if (!global.db.data?.users) loadDatabase()
                let userName, userJidConnected
                userName = sock.authState.creds.me.name || 'Anónimo'
                userJidConnected = sock.authState.creds.me.jid || `${path.basename(pathShadowJadiBot)}@s.whatsapp.net`
                
                console.log(chalk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• SUB-BOT •】⸺⸺⸺⸺❒\n│\n│ 🟢 ${userName} (+${path.basename(pathShadowJadiBot)}) conectado exitosamente.\n│\n❒⸺⸺⸺【• CONECTADO •】⸺⸺⸺❒`))
                
                sock.isInit = true
                
                if (!global.conns.some(c => c.user?.jid === sock.user?.jid)) {
                    global.conns.push(sock)
                }

                if (!global.db.data.users[m.sender].subbot_activated_time) {
                    global.db.data.users[m.sender].subbot_activated_time = new Date().getTime();
                }
                
                let expirationTime = global.db.data.users[m.sender].subbot_activated_time + SESSION_DURATION_MS;
                let expirationDate = new Date(expirationTime);
                let dateStr = expirationDate.toLocaleString('es-ES', { 
                    year: 'numeric', month: '2-digit', day: '2-digit', 
                    hour: '2-digit', minute: '2-digit', second: '2-digit', 
                    hour12: false 
                });

                if (options.fromCommand) {
                    m?.chat ? await conn.reply(m.chat, 
                        `@${m.sender.split('@')[0]}, *¡Genial! Ya eres parte de la familia Sub-Bots.*\n\n` +
                        `> *Tu Sub-Bot estará activo hasta el:*\n` +
                        `> *${dateStr}*\n\n` +
                        `> *En caso de que se desconecte, usa el "token" y gracias por el apoyo. Cualquier error contacta al owner 📪*\n> Subbot guardado en la carpeta *Jadibot*`, 
                        m, 
                        global.rcanal
                    ) : '';
                }
            }
        }
        
        setInterval(async () => {
            if (!sock.user) {
                cleanSession(userJid);
            } else {
                const currentTime = new Date().getTime();
                let jidBase = sock.user.jid.split('@')[0];
                
                if (global.db.data.users[jidBase] && global.db.data.users[jidBase].subbot_activated_time) {
                    let activatedTime = global.db.data.users[jidBase].subbot_activated_time;
                    
                    if (currentTime > activatedTime + SESSION_DURATION_MS) {
                        console.log(chalk.bold.red(`\n[ ❌ EXPIRACIÓN ] Sesión (+${path.basename(pathShadowJadiBot)}) expirada. Cerrando...`));
                        
                        try {
                            await sock.sendMessage(sock.user.jid, { text: '*[ ⏳ SESIÓN EXPIRADA ]*\n\n> *Tu tiempo como Sub-Bot ha finalizado. Gracias por el apoyo.*' });
                        } catch {}
                        
                        cleanSession(userJid, true);
                    }
                }
            }
        }, 60000)

        let handler = await import('../handler.js')
        let creloadHandler = async function (restatConn) {
            try {
                const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
                if (Object.keys(Handler || {}).length) handler = Handler
            } catch (e) {
                console.error('⚠️ Nuevo error al cargar handler: ', e)
            }
            
            if (restatConn) {
                const oldChats = sock.chats
                try { sock.ws.close() } catch { }
                sock.ev.removeAllListeners()
                sock = makeWASocket(connectionOptions, { chats: oldChats })
                isInit = true
            }
            
            if (!isInit) {
                sock.ev.off("messages.upsert", sock.handler)
                sock.ev.off("connection.update", sock.connectionUpdate)
                sock.ev.off('creds.update', sock.credsUpdate)
            }

            sock.handler = handler.handler.bind(sock)
            sock.connectionUpdate = connectionUpdate.bind(sock)
            sock.credsUpdate = saveCreds.bind(sock, true)
            sock.ev.on("messages.upsert", sock.handler)
            sock.ev.on("connection.update", sock.connectionUpdate)
            sock.ev.on("creds.update", sock.credsUpdate)
            isInit = false
            return true
        }
        creloadHandler(false)
    })
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function msToTime(duration) {
    var seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    hours = (hours < 10) ? '0' + hours : hours
    minutes = (minutes < 10) ? '0' + minutes : minutes
    seconds = (seconds < 10) ? '0' + seconds : seconds
    return minutes + ' m y ' + seconds + ' s '
}
