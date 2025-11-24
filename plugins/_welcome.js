export async function participantsUpdate(conn, m) {
    const chat = m.id
    const action = m.action
    
    if (action !== 'add' && action !== 'remove') return

    let groupName = 'el grupo'
    try {
        const metadata = await conn.groupMetadata(chat)
        groupName = metadata.subject
    } catch (e) {
        console.error('Error al obtener la metadata del grupo:', e)
    }

    for (let user of m.participants) {
        const userNameMention = `@${user.split('@')[0]}`

        if (action === 'add') {
            const welcomeText = `¡Bienvenido/a a ${groupName} ${userNameMention}!`
            
            await conn.sendMessage(chat, { 
                text: welcomeText,
                mentions: [user]
            })

        } else if (action === 'remove') {
            const goodbyeText = `Un usuario salió del grupo ${groupName}. ¡Adiós ${userNameMention}!`
            
            await conn.sendMessage(chat, { 
                text: goodbyeText,
                mentions: [user]
            })
        }
    }
}
