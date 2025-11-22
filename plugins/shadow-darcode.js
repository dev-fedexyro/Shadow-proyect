/* Código creado por Dev-fedexyz • fede Uchiha 
* https://github.com/dev-fedexyzz*/

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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ShadowJBOptions = {}

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    let who
    
    if (args[0]) {
        const digits = args[0].replace(/[^0-9]/g, ''); 
        if (digits.length >= 8) {
            who = digits + '@s.whatsapp.net'
        }
    } 
    
    if (!who) {
        return conn.reply(m.chat, `\`\`\`❌ FALTA EL NÚMERO DE TELÉFONO:\`\`\`\n\n> *Debe ingresar el número de teléfono* del usuario al que se le enviará el código.`, m);
    }

    let pathShadowJadiBot = path.join(`./jadibot-sessions/`, who.split('@')[0])
    
    ShadowJBOptions.pathShadowJadiBot = pathShadowJadiBot
    ShadowJBOptions.m = m
    ShadowJBOptions.conn = conn
    ShadowJBOptions.args = args
    ShadowJBOptions.usedPrefix = usedPrefix
    ShadowJBOptions.command = command
    ShadowJBOptions.userToSendCode = who 
    
    await ShadowJadiBot(ShadowJBOptions)
} 

handler.help = ['darcode <number>']
handler.tags = ['owner']
handler.command = ['darcode']
handler.owner = true
export default handler 

export async function ShadowJadiBot(options) {
    let { pathShadowJadiBot, m, conn, args, usedPrefix, command, userToSendCode } = options
    
    let userJid = userToSendCode 
    const expirationTime = 120;

    if (!fs.existsSync(pathShadowJadiBot)){
        fs.mkdirSync(pathShadowJadiBot, { recursive: true })
    }

    const pathCreds = path.join(pathShadowJadiBot, "creds.json")
    
    if (fs.existsSync(pathCreds)) {
        fs.unlinkSync(pathCreds)
        console.log(chalk.yellow(`Credenciales eliminadas para ${userJid}`))
    }

    let { version, isLatest } = await fetchLatestBaileysVersion()
    const { state, saveState, saveCreds } = await useMultiFileAuthState(pathShadowJadiBot)

    const connectionOptions = {
        logger: pino({ level: "fatal" }),
        printQRInTerminal: false,
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
        browser: ['Ubuntu', 'Chrome', '110.0.5585.95'], 
        version: version,
        generateHighQualityLinkPreview: true
    };

    let sock = makeWASocket(connectionOptions)

    async function connectionUpdate(update) {
        const { connection, lastDisconnect, qr } = update
        
        if (qr) { 
            try {
                let phoneNumber = userJid.split('@')[0];
                let rawCode = await sock.requestPairingCode(phoneNumber);
                let formattedCode = rawCode.match(/.{1,4}/g)?.join("-");

                const pairingCodeMessage = `
\`\`\`🔑 Código de Vinculación de Sub-Bot:\`\`\`

> *Hola, ${phoneNumber}.* El dueño del bot te ha generado un código para vincular tu Sub-Bot.

*Código:* \`\`\`${formattedCode}\`\`\`

*_⚠️ Este mensaje se autodestruirá en ${expirationTime / 60} minutos para mayor seguridad._*
`;
                
                await conn.sendMessage(userJid, { 
                    text: pairingCodeMessage.trim()
                }, { ephemeralExpiration: expirationTime });

                await conn.reply(m.chat, `✅ *Código enviado exitosamente* al usuario: *${phoneNumber}*.\n\n> *El código se envió al privado del usuario*`, m);

                await sock.ws.close();
                sock.ev.removeAllListeners();
                
                if (fs.existsSync(pathShadowJadiBot)) {
                    fs.rmdirSync(pathShadowJadiBot, { recursive: true })
                    console.log(chalk.green(`Sesión eliminada de ${pathShadowJadiBot}`))
                }
                
            } catch (e) {
                console.error('Error al generar o enviar código:', e);
                await conn.reply(m.chat, `❌ *Error al generar/enviar el código de vinculación* a ${userJid.split('@')[0]}.`, m);
            }
        }

        if (connection === 'open') {
            console.log(chalk.red(`\n[ ⚠️ ERROR DARCODE ] Sesión de +${path.basename(pathShadowJadiBot)} se abrió inesperadamente. Cerrando y limpiando.`));
            try {
                await sock.sendMessage(userJid, { text: '*[ ⚠️ ERROR ]* Se abrió la sesión en vez de solo dar el código. Sesión cerrada y eliminada. Inténtelo de nuevo.' });
            } catch {}
            
            try { sock.ws.close() } catch {}
            sock.ev.removeAllListeners();
            if (fs.existsSync(pathShadowJadiBot)) {
                fs.rmdirSync(pathShadowJadiBot, { recursive: true })
            }
            
            return
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
            if (reason === 401 || reason === 405) {
                console.log(chalk.bold.magentaBright(`\nLa conexión se cerró para +${path.basename(pathShadowJadiBot)}. (Esperado después de código)`))
                if (fs.existsSync(pathShadowJadiBot)) {
                    fs.rmdirSync(pathShadowJadiBot, { recursive: true })
                }
            } else if (reason !== 515 && reason !== 428 && reason !== 408) {
                console.log(chalk.bold.red(`\n[ ❌ ERROR DARCODE ] Conexión cerrada inesperadamente para +${path.basename(pathShadowJadiBot)}. Razón: ${reason}`))
                if (fs.existsSync(pathShadowJadiBot)) {
                    fs.rmdirSync(pathShadowJadiBot, { recursive: true })
                }
            }
        }
    }

    sock.connectionUpdate = connectionUpdate.bind(sock)
    sock.credsUpdate = saveCreds.bind(sock, true)
    sock.ev.on("connection.update", sock.connectionUpdate)
    sock.ev.on("creds.update", sock.credsUpdate)
    }

