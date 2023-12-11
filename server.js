const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const APP_PORT = process.env.APP_PORT || 3000;
const APP_URL = process.env.APP_URL || `http://localhost:${APP_PORT}`;

app.use("/public", express.static("public"));
app.get("/", (req, res) =>  res.sendFile(__dirname + "/public/index.html"))
app.get("/admin", (req, res) =>  res.sendFile(__dirname + "/public/admin.html"))

server.listen(APP_PORT, () =>
  console.log(`Servidor ouvindo a porta ${APP_PORT}!`)
);

/** Lista com todos participantes conectados */
let clients = [];

/** constante de ações do websocket */
const ACTIONS = {
    ADMIN: "admin",
    RAFFLE: "raffle",
    CLIENT_COUNT_UPDATE: "clientCountUpdate",
}

/**
 * Efetua o sorteio e envia a mensagem de ganhador para o client vencedor e a mensagem de 
 * perdedor para os demais
 * @param {string} confirmationCode 
 */
const handleRaffle = (confirmationCode) => {
    let participants = Array.from(wss.clients).filter((client) => {
        const notIsAdmin = !client.isAdmin;
        return notIsAdmin;
    })
    const randomIndex = Math.floor(Math.random() * participants.length);

    const winner = participants[randomIndex];

    participants.forEach((participant) => {
        let result = JSON.stringify({ status: 'youlose' });
        const isWinner = participant === winner;

        if (isWinner) result = JSON.stringify({ status: 'youwin', code: confirmationCode });

        participant.send(result);
    })
}

/**
 * Lida com a mensagem recebida do web socket de todas as páginas, tratando de acordo com a ação 
 * recebida na mensagem. 
 * Para o admin é adicionado o identificador pelo isAdmin
 * Para o sorteio é chamada a função de sorteio
 * @param ws - client do websocket
 * @param {Object} message - mensagem recebida do websocket
 */
const handleIncomingMessage = (ws, message) => {
    const currentMessage = JSON.parse(message);
    const action = currentMessage.action;

    switch (action) {
        case ACTIONS.ADMIN:
            ws.isAdmin = true;
            break;
        case ACTIONS.RAFFLE:
            handleRaffle(currentMessage.code)
            break;
        default:
            console.warn("Ação não reconhecida!")
            break;
    }
}

/**
 * Atualiza o contador de clients conectados para a exibição no admin
 */
const updateAdminClientCount = () => {
    const clientCount = Array.from(wss.clients).filter(client => {
        return !client.isAdmin
    }).length;

    Array.from(wss.clients).forEach(client => {
        const socketIsOpen = client.readyState === WebSocket.OPEN;
        
        if (client.isAdmin && socketIsOpen) {
            client.send(JSON.stringify({ 
                action: ACTIONS.CLIENT_COUNT_UPDATE,
                data: clientCount 
            }));
        }
    })

}

/** 
 * Inicia a conexão com o servidor de web socket
 */
wss.on('connection', (ws) => {
    clients.push(ws);
    console.log("Novo client conectado!");
    updateAdminClientCount();

    // Lida com as mensagens recebidas do client conectado passando o client do websocket por padrão como primeiro parâmetro, assim ao executar o evento o segundo parâmetro será a mensagem enviada pelo client
    ws.on('message', handleIncomingMessage.bind(null, ws));

    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
        console.log("Client desconectado!");
        updateAdminClientCount();
    })
});
