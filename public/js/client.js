const socket = new WebSocket(WS_URL);

const body = document.querySelector("body");
const messageDiv = document.getElementById("message");

const setClientState = (state, code) => {
    body.className = state;
    messageDiv.innerText = `Código de confirmação: ${code}`;
}

const handleServerMessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Mensagem recebida do servidor: ", data);

    if (data.status === STATUS.WIN) {
        setClientState("win", data.code);

        return;
    }

    setClientState("lose");
}

socket.addEventListener("message", handleServerMessage);