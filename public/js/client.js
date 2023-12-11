const body = document.querySelector("body");
const titleRaffle = document.getElementById("title");
const messageDiv = document.getElementById("message");

/**
 * Define o estado da página para cada client aberto de acordo com o estado do jogo
 * @param {string} state - Estado do jogo se o usuário ganhou ou perdeu
 * @param {string} code - Código de confirmação se o usuário ganhou
 * @returns 
 */
const setClientState = (state, code) => {
    body.className = state;

    if(state === "lose") {
        titleRaffle.innerText = "Você não ganhou.";
        messageDiv.innerText = "Que pena, quem sabe na próxima...";
        return;
    }
    
    titleRaffle.innerText = "Você ganhou!";
    messageDiv.innerText = `Mostre seu código de confirmação: ${code}`;
}

/**
 * Lida com a mensagem obtida do servidor para cada client, definindo a exibição para
 * cada usuário de acordo com o estado do jogo.
 * @param event - evento obtido do servidor de web socket
 * @returns 
 */
const handleServerMessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Mensagem recebida do servidor: ", data);

    if (data.status === STATUS.WIN) {
        setClientState("win", data.code);

        return;
    }

    setClientState("lose");
}

/**
 * Conecta o web socket na página do participante do sorteio e atribui a função de tratamento
 * de mensagem do servidor
 */
const connectWebSocket = () => {
    const socket = new WebSocket(WS_URL);

    socket.addEventListener("message", handleServerMessage);
}

connectWebSocket()
