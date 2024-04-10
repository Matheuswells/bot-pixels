const WebSocket = require('ws');

// Função para parsear as árvores
const parseTrees = (message) => {
    const separator = 'lastChop�';
    const treeData = message.split(separator).slice(1); // Ignorar o primeiro elemento, pois está vazio

    const trees = treeData.map((tree, index) => {
        const treeInfo = tree.split('��'); // Dividir por outro padrão para obter lastChop e lastTimer
        if (treeInfo.length >= 2) {
            const lastChop = index + 1; // Número da árvore (começando de 1)
            const lastTimer = parseInt(treeInfo[1], 10); // Interpretar como inteiro
            const nextChopTime = getNextChopTime(lastTimer);
            return { lastChop, nextChopTime };
        }
        return null;
    }).filter(Boolean);

    return trees;
};

// Função para calcular o próximo tempo de corte
const getNextChopTime = (lastTimer) => {
    const nextChopTime = lastTimer + (7 * 60 * 60 * 1000) + (15 * 60 * 1000);
    return nextChopTime;
};

async function getWs (session, landNumber) {
    try {
        if(session === undefined ) {
            return;
        }
        const messagesList = []; // Lista para armazenar as mensagens para esta land
        let flag = false
        // console.log("WS:", `wss://pixels-server.pixels.xyz/${session.room.processId}/${session.room.roomId}?sessionId=${session.sessionId}`);
        const ws = new WebSocket(`wss://pixels-server.pixels.xyz/${session.room.processId}/${session.room.roomId}?sessionId=${session.sessionId}`);
        if (!ws) {
            return;
        }
        ws.binaryType = "arraybuffer";
        ws.on('message', async function message(data) {
            try {
                const uint8Array = new Uint8Array(data);
                const jsonString = new TextDecoder().decode(uint8Array);
    
                const trees = parseTrees(jsonString);
    
                if (trees.length > 0) {
                    // Ordenar árvores por próximo horário de corte
                    // trees.sort((a, b) => a.nextChopTime - b.nextChopTime);
    
                    // console.log("Trees:", trees);
                    for (const tree of trees) {
                        const formattedNextChopTime = new Date(tree.nextChopTime).toLocaleTimeString();
                        // console.log(`Tree ${tree.lastChop}: ${formattedNextChopTime}`);
    
                        // Adicionar mensagem à lista
                        const messageToSend = `${tree.lastChop}#${formattedNextChopTime}`;
                        messagesList.push(messageToSend);
                    }
    
                    flag = true
                }
    
                ws.close();
            } catch (error) {
                ws.close();
                console.log('Erro ao processar mensagem:', error);
            }
        });
    
        ws.on('open', function open() {
            ws.send(new Uint8Array([10]).buffer);
        });
    
        let counter = 0 // contador para evitar loops infinitos
        while (!flag) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            counter++
            if (counter > 4) {
                break
            }
        }
    
    
        const landNumberStr = landNumber.metadata.mapId.split('-')[1];
        return {trees: messagesList, land: landNumberStr};
    } catch (error) {
        console.log('Erro ao processar mensagem:', error);
        return;
    }
};

module.exports = { getWs };