const { v4: uuidv4} = require('uuid');

let socket;

const generateCode = () => {
    return uuidv4();
}

const updateClientCount = (count) => {
    const clientCountElement = document.getElementById("clientCount");
    clientCountElement.innerText = count;
}

const handleSocketOpen = () => {
    console.log("Conexão com o WebSocket estabelecida!");

    const adminMessage = JSON.stringify({ action: ACTIONS.ADMIN });
    socket.send(adminMessage);
}

const handleSocketMessage = (event) => {
    const data = JSON.parse(event.data);

    if(data.action === ACTIONS.CLIENT_COUNT_UPDATE) {
        updateClientCount(data.data);
    }
}

const handleSocketClose = () => {
    console.log("Conexão com o WebSocket fechada! Tentando reconectar em 5 segundos...");

    setTimeout(connectWebSocket(), 5000);
}

const handleSocketError = (error) => {
    console.error("Erro na conexão com o WebSocket: ", error);
}

const connectWebSocket = () => {
    socket = new WebSocket(WS_URL);

    socket.addEventListener("open", handleSocketOpen);
    socket.addEventListener("message", handleSocketMessage);
    socket.addEventListener("close", handleSocketClose);
    socket.addEventListener("error", handleSocketError);  
}

connectWebSocket();

const drawButton = document.getElementById("drawButton");
const messageDiv = document.getElementById("message");

const handleDrawClick = () => {
    const confirmationCode = generateCode();
    const socketIsOpen = socket.readyState === WebSocket.OPEN;

    if(!socketIsOpen) return console.warn("Websocket não está aberto! Aguarde e tente novamente em instantes.")

    socket.send(JSON.stringify({ action: ACTIONS.DRAW, code: confirmationCode }));
    messageDiv.innerText = `Código de confirmação: ${confirmationCode}`;
}

document.addEventListener("click", handleDrawClick)