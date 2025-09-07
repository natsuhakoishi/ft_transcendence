import type { GameData } from "../../share/type/gameData";

const ws = new WebSocket("ws://localhost:3000/game");

let playerMethod: string = "arrow";
// let keyPress: string = "";

let data: GameData = {userId: 0, roomId: "", keyPress: ""};

export function pongGame(): void {
    
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
            ws.send("uppppp");
        }
})

pongGame();
