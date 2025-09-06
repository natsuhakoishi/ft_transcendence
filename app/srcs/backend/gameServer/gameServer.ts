import { WebSocketServer } from "ws";
import { gameData } from "../../share/type/gameData.ts";

const wss = new WebSocketServer({ port: 3000 });

//wss = server
//ws = every clients
wss.on('connection', (ws) => {
    console.log("connected");

    ws.on("message", (msg) => {
        console.log("receive message from client", msg.toString());

        let data: gameData = JSON.parse(msg.toString());
        console.log("player id:" + data.userId.toString());
        console.log("player pressed" + data.keyPress);

        // wss.clients.forEach(client => {
        //     if (client.readyState === ws.OPEN)
        //         client.send("server received: " + msg.toString());
        // });
    });

    ws.on("close", () => console.log("client disconnected"));

});
