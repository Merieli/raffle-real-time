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

let clients = [];

const ACTIONS = {
    ADMIN: "admin",
    DRAW: "draw",	
    CLIENT_COUNT_UPDATE: "clientCountUpdate",
}

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

const handleDraw = (confirmationCode) => {
    let participants = Array.from(wss.clients).filter((client) => {
        const notIsAdmin = !client.isAdmin;
        return notIsAdmin;
    })

    const randomIndex = Math.floor(Math.random() * participants.length);
    const winner = participants[randomIndex];

    participants.forEach((participant) => {
        let result = JSON.stringify({ status: STATUS.LOSE });
        const isWinner = participant === winner;

        if (isWinner) result = JSON.stringify({ status: STATUS.WIN, code: confirmationCode });

        participant.send(result);
    })
}

const handleIncomingMessage = (ws, message) => {
    const currentMessage = JSON.parse(message);
    const action = currentMessage.action;

    switch (action) {
        case ACTIONS.ADMIN:
            ws.isAdmin = true;
            break;
        case ACTIONS.DRAW:
            handleDraw(currentMessage.code)
            break;
        default:
            console.warn("Ação não reconhecida!")
            break;
    }
}

wss.on('connection', (ws) => {
    clients.push(ws);
    console.log("Novo client conectado!");
    updateAdminClientCount();

    ws.on('message', handleIncomingMessage.bind(null, ws));

    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
        console.log("Client desconectado!");
        updateAdminClientCount();
    })
});

// parei em 27:59