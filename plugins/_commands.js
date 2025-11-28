import PhoneNumber from 'awesome-phonenumber';
import moment from 'moment-timezone';
import path from 'path';

function banderaEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '';
    const codePoints = [...countryCode.toUpperCase()]
        .map(char => 0x1F1E6 + char.charCodeAt(0) - 65);
    return String.fromCodePoint(...codePoints);
}

function getCountryFlag(sender) {
    try {
        const number = sender.replace('@s.whatsapp.net', '');
        const phoneInfo = PhoneNumber('+' + number);
        const countryCode = phoneInfo.getRegionCode('international');
        return banderaEmoji(countryCode) || '🌐';
    } catch (e) {
        return '🌐';
    }
}

function levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            const cost = a[j - 1] === b[i - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      
                matrix[i][j - 1] + 1,      
                matrix[i - 1][j - 1] + cost 
            );
        }
    }
    return matrix[b.length][a.length];
}

function getAllValidCommands() {
    const allCommands = [];
    for (let plugin of Object.values(global.plugins)) {
        if (plugin.command) {
            const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
            allCommands.push(...cmds.filter(c => typeof c === 'string' && c.length > 0));
        }
    }
    return allCommands;
}

function suggestClosestCommands(command, allCommands, threshold = 40, limit = 3) {
    let closestCommands = [];
    
    for (let cmd of allCommands) {
        const dist = levenshteinDistance(command, cmd);
        const maxLength = Math.max(command.length, cmd.length);
        if (maxLength === 0) continue;
        
        const similarity = Math.round((1 - dist / maxLength) * 100); 

        if (similarity >= threshold) { 
            closestCommands.push({ cmd, similarity });
        }
    }

    closestCommands.sort((a, b) => b.similarity - a.similarity);
    return closestCommands.slice(0, limit);
}

async function sendNotFoundMessage(m, usedPrefix, command, topMatches) {
    const mundo = getCountryFlag(m.sender);
    
    let replyMessage = `❌ Comando *\`${command}\`* no encontrado en la base de datos. 😅\n`;
    replyMessage += `> ${mundo} Utiliza *\`${usedPrefix}menu\`* para ver la lista completa.\n\n`;

    if (topMatches.length > 0) {
        replyMessage += `*💡 Sugerencias (por similitud):*\n`;
        topMatches.forEach((match) => {
            replyMessage += `  › \`${usedPrefix + match.cmd}\` (${match.similarity}%)\n`;
        });
    }
    
    await m.reply(replyMessage);
}


export async function before(m) {
     let fkontak = { 
        "key": { 
            "participants":"0@s.whatsapp.net", 
            "remoteJid": "status@broadcast", 
            "fromMe": false, 
            "id": "Halo" 
        }, 
        "message": { 
            "contactMessage": { 
                "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
            }
        }, 
        "participant": "0@s.whatsapp.net" 
    }

    if (!m.text || !global.prefix.test(m.text)) return;

    const usedPrefix = global.prefix.exec(m.text)[0];
    const command = m.text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase();

    if (!command || command.length === 0) return;
    
    const allCommands = getAllValidCommands();
    const isCommandFound = allCommands.includes(command);

    if (isCommandFound) {
        const chat = global.db.data.chats[m.chat] || {};
        
        if (chat.isBanned) {
            const mundo = getCountryFlag(m.sender);

            await m.reply(`🚫 El bot está desactivado en este chat. Un administrador puede usar \`${usedPrefix}unbanchat\` para reactivarlo.`);
            return true;
        }

        global.db.data.users[m.sender] = global.db.data.users[m.sender] || {};
        global.db.data.users[m.sender].commands = (global.db.data.users[m.sender].commands || 0) + 1;
        
        return false; 

    } else {
        const topMatches = suggestClosestCommands(command, allCommands, 50, 3);
        await sendNotFoundMessage(m, usedPrefix, command, topMatches);
        
        return true; 
    }
    }
