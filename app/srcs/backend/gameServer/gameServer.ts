import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', (ws) => {
    console.log("connected");

    ws.on("message", (msg) => {
        console.log("receive message from client", msg.toString());

        wss.clients.forEach(client => {
            if (client.readyState === ws.OPEN)
                client.send("server received: " + msg.toString());
        });
    });

    wss.on("close", () => console.log("disconnected"));

});
