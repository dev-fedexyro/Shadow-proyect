import { WAMessageStubType } from '@whiskeysockets/baileys'
import chalk from 'chalk'
import { watchFile } from 'fs'

const terminalImage = global.opts['img'] ? require('terminal-image') : ''
const urlRegex = (await import('url-regex-safe')).default({ strict: false })

const COLOR = {
    TITLE: chalk.bold.hex('#00FFFF'),
    SENDER: chalk.bold.hex('#FF00FF'),
    CHAT: chalk.hex('#9370DB'),
    TIME: chalk.dim.hex('#7FFFD4'),
    META: chalk.hex('#1E90FF'),
    WARN: chalk.hex('#FF4500'),
    CMD: chalk.hex('#FFFF00'),
    MENTION: chalk.bold.hex('#00FF7F'),
    SEP: chalk.hex('#191970').bold
}

function formatFilesize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1000
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`
}

async function formatMessageContent(text, conn, depth = 4) {
    let formattedText = text.replace(/\u200e+/g, '')
    const mdRegex = /(?<=(?:^|[\s\n])\S?)(?:([*_~`])(?!`)(.+?)\1|```((?:.|[\n\r])+?)```|`([^`]+?)`)(?=\S?(?:[\s\n]|$))/g
    
    const mdFormat = (d = 4) => (_, type, content, monospace) => {
        const types = { 
            '_': 'italic', 
            '*': 'bold', 
            '~': 'strikethrough', 
            '`': 'bgGray' 
        }
        content = content || monospace
        const formatted = !types[type] || d < 1 ? content : chalk[types[type]](content.replace(/`/g, '').replace(mdRegex, mdFormat(d - 1)))
        return formatted
    }

    formattedText = formattedText.replace(mdRegex, mdFormat(depth))

    formattedText = formattedText.split('\n').map(line => {
        if (line.trim().startsWith('>')) {
            return chalk.bgGray.dim(line.replace(/^>/, COLOR.SENDER(' > ')))
        } else if (/^([1-9]|[1-9][0-9])\./.test(line.trim())) {
            return line.replace(/^(\d+)\./, (match, number) => COLOR.META(`  ${number}.`))
        } else if (/^[-*]\s/.test(line.trim())) {
            return line.replace(/^[*-]/, COLOR.META('  •'))
        }
        return line
    }).join('\n')

    if (formattedText.length < 1024) {
        formattedText = formattedText.replace(urlRegex, url => chalk.blue.underline(url))
    }
    
    const mentions = await conn.mentionedJid
    if (mentions && mentions.length > 0) {
        for (let user of mentions) {
            formattedText = formattedText.replace('@' + user.split`@`[0], COLOR.MENTION('@' + await conn.getName(user)))
        }
    }

    return formattedText
}

export default async function (m, conn = { user: {} }) {
    if (m.sender === conn.user?.jid) return

    const _name = await conn.getName(m.sender)
    const senderID = m.sender.replace('@s.whatsapp.net', '')
    const sender = COLOR.SENDER(`[USER]: @${senderID}${_name ? ` (${_name})` : ''}`)
    const chat = await conn.getName(m.chat)
    const chatName = chat ? (m.isGroup ? `[GROUP]: ${chat}` : `[P2P]: ${chat}`) : '[CHAT: UNKNOWN]'
    const me = `+${(conn.user?.jid || '').replace('@s.whatsapp.net', '')}`
    const userName = conn.user.name || conn.user.verifiedName || "Desconocido"
    
    const filesizeRaw = (m.msg ? m.msg.vcard ? m.msg.vcard.length : m.msg.fileLength ? m.msg.fileLength.low || m.msg.fileLength : m.msg.axolotlSenderKeyDistributionMessage ? m.msg.axolotlSenderKeyDistributionMessage.length : m.text ? m.text.length : 0 : m.text ? m.text.length : 0) || 0
    const filesize = formatFilesize(filesizeRaw)

    const date = new Date(m.messageTimestamp ? 1000 * (m.messageTimestamp.low || m.messageTimestamp) : Date.now())
    const formattedTime = date.toLocaleTimeString("es-ES", { timeZone: "America/Mexico_City" })
    const formattedDate = date.toLocaleDateString("es-ES", { timeZone: "America/Mexico_City", day: '2-digit', month: '2-digit', year: 'numeric' })

    const mtypeClean = m.mtype ? 
        m.mtype.replace(/message$/i, '').replace('audio', m.msg?.ptt ? 'PTT' : 'AUDIO').toUpperCase()
        : 'UNKNOWN'
    
    let img
    if (global.opts['img']) {
        try {
            img = /sticker|image/gi.test(m.mtype) ? await terminalImage.buffer(await m.download()) : false
        } catch (e) {
            console.error(COLOR.WARN('ERROR: Failed to display image.'), e)
        }
    }

    const sep = COLOR.SEP('-'.repeat(process.stdout.columns || 60))

    console.log(`\n${COLOR.TITLE('::: LOG | TRANSACTION REPORT :::')}`)
    console.log(sep)

    console.log(
        `${sender}\n` +
        `${COLOR.CHAT(chatName)} ${COLOR.TIME(`[${formattedDate} ${formattedTime}]`)}\n` +
        `${COLOR.TITLE(`[BOT]: ${userName}`)} ${chalk.dim(`(${me})`)}`
    )

    console.log(sep)

    console.log(
        `${COLOR.META('TYPE:')} ${COLOR.META.bold(mtypeClean)}` + 
        ` | ${COLOR.META('SIZE:')} ${COLOR.META.bold(filesize)}` +
        ` (${filesizeRaw} B)`
    )
    
    if (img) console.log(`\n${img.trimEnd()}`)

    if (typeof m.text === 'string' && m.text) {
        const log = await formatMessageContent(m.text, m.key.id.startsWith('BAE5') ? conn.chats : conn)
        
        let prefix = m.error != null ? COLOR.WARN('>>> ERROR: ') : m.isCommand ? COLOR.CMD('>>> CMD: ') : COLOR.TITLE('>>> MSG: ')
        let output = m.error != null ? COLOR.WARN(log) : m.isCommand ? COLOR.CMD(log) : log

        console.log(`${prefix}${output}`)
    }

    if (m.messageStubType || /document|contact|audio/i.test(m.mtype)) {
        console.log(sep)
    }

    if (m.messageStubType) {
        console.log(`${COLOR.TITLE('EVENT TYPE:')} ${COLOR.WARN(WAMessageStubType[m.messageStubType] || 'UNKNOWN')}`)
    }

    if (m.messageStubParameters) {
        const participants = m.messageStubParameters.map(jid => {
            jid = conn.decodeJid(jid)
            const name = conn.getName(jid)
            return COLOR.MENTION(`@${jid.replace('@s.whatsapp.net', '')}`) + (name ? ` (${name})` : '')
        }).join(', ')
        console.log(`${COLOR.TITLE('PARTICIPANTS:')} ${participants}`)
    }

    if (/document/i.test(m.mtype)) {
        console.log(`${COLOR.TITLE('FILE:')} ${m.msg.fileName || m.msg.displayName || 'Untitled Document'}`)
    } else if (/ContactsArray|contact/i.test(m.mtype)) {
        console.log(`${COLOR.TITLE('CONTACT:')} ${m.msg.displayName || 'Multiple Contacts'}`)
    } else if (/audio/i.test(m.mtype)) {
        const duration = m.msg.seconds
        const minutes = Math.floor(duration / 60).toString().padStart(2, '0')
        const seconds = (duration % 60).toString().padStart(2, '0')
        console.log(`${COLOR.TITLE('DURATION:')} ${minutes}:${seconds}`)
    }
    
    console.log(sep)
    console.log(COLOR.TITLE('::: END OF REPORT :::\n'))
}

let file = global.__filename(import.meta.url)
watchFile(file, () => {
    console.log(COLOR.WARN("WARNING: Update detected in 'lib/print.js'"))
})
