let socket;

const raffleButton = document.getElementById("raffle");
const messageDiv = document.getElementById("message");

/**
 * Lida com o evento de abertura do web socket na página de admin, enviando uma mensagem que
 * identifica o client como admin
 */
const handleSocketOpen = () => {
    console.log("Conexão com o WebSocket estabelecida!");
    const adminMessage = JSON.stringify({ action: ACTIONS.ADMIN });
    socket.send(adminMessage);
}

/**
 * Atualiza o contador de clientes conectados a partir do momento em que o admin se conecta
 */ 
const updateParticipantsCount = (count) => {
    const clientCountElement = document.getElementById("participantsCount");
    clientCountElement.innerText = count;
}

/**
 * Lida com o evento de mensagem do web socket na página de admin, atualizando o contador de 
 * participantes
 * @param {*} event 
 */
const handleSocketMessage = (event) => {
    const data = JSON.parse(event.data);
    console.debug("🟣 ~ file: admin.js:31 ~ handleSocketMessage ~ data:", data)

    if(data.action === ACTIONS.CLIENT_COUNT_UPDATE) {
        updateParticipantsCount(data.data);
    }
}

/**
 * Lida com o evento de fechamento do web socket na página de admin, tentando reconectar em 
 * 5 segundos
 */
const handleSocketClose = () => {
    console.log("Conexão com o WebSocket fechada! Tentando reconectar em 5 segundos...");

    setTimeout(connectWebSocket(), 5000);
}

/**
 * Lida com o evento de erro do web socket na página de admin, exibindo o erro no console
 * @param error - erro obtido do web socket
 */
const handleSocketError = (error) => {
    console.error("Erro na conexão com o WebSocket: ", error);
}

/**
 * Conecta o web socket na página de admin e atribui todas as funções a serem executadas
 * em cada evento do web socket para trativas front-end
 */
const connectWebSocket = () => {
    socket = new WebSocket(WS_URL);

    socket.addEventListener("open", handleSocketOpen);
    socket.addEventListener("message", handleSocketMessage);
    socket.addEventListener("close", handleSocketClose);
    socket.addEventListener("error", handleSocketError);  
}

connectWebSocket();

/**
 * Gera o código de confirmação para validação do sorteio
 */
const generateCode = (length) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
}

/**
 * Lida com o clique no botão de sorteio, enviando uma mensagem para o servidor de web socket
 * @returns 
 */
const handleRaffleClick = () => {
    const confirmationCode = generateCode(4);
    const socketIsOpen = socket.readyState === WebSocket.OPEN;

    if(!socketIsOpen) return console.warn("Websocket não está aberto! Aguarde e tente novamente em instantes.")

    socket.send(JSON.stringify({ action: ACTIONS.RAFFLE, code: confirmationCode }));
    messageDiv.innerText = `Código de confirmação: ${confirmationCode}`;
}

raffleButton.addEventListener("click", handleRaffleClick)