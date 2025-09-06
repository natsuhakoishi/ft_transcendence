import { gameData } from "../../share/type/gameData.ts";

const ws = new WebSocket("ws://localhost:3000");

let playerMethod: string = "arrow";
// let keyPress: string = "";

let data: gameData = {};

function pongGame(): void {
    
}

ws.onopen = () => {
    console.log("Client connected to server");
    ws.send("Hiiii");
};

ws.onmessage = (event) => {
    console.log("server: ", event.data);
}


document.addEventListener("keypress", event => {
    if (playerMethod === "arrow")
        if (event.key === "up" || event.key === "down")
        {
            data.keyPress = event.key;
            ws.send();
        }
})

pongGame();