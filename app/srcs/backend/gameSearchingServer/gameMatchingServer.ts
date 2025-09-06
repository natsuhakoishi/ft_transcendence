import WebSocket, { WebSocketServer } from "ws";

interface Player {
    id: number;
    ws: WebSocket;
}

const wss = new WebSocketServer({ port: 3010 });
const waitingPlayers: Player[] = [];

//wss = server
//ws = every clients
wss.on('connection', (ws) => {
    console.log("connected");

    ws.on("message", msg => {
        const playerID: number = parseInt(msg.toString(), 10);

        console.log("Waiting player: " + msg.toString());

        waitingPlayers.push({ id: playerID, ws});

        if (waitingPlayers.length >= 2)
        {
            const p1: Player = waitingPlayers.shift()!;
            const p2: Player = waitingPlayers.shift()!;

            const queryString = `p1=${p1.id}&p2=${p2.id}`;
            p1.ws.send(queryString);
            p2.ws.send(queryString);

            console.log("qs: " + queryString);
            console.log(`Matched players: ${p1.id} vs ${p2.id}`);
        }
    })

    ws.on("close", () => {
        const idx = waitingPlayers.findIndex(p => p.ws === ws);

        console.log("player disconnected")
        if (idx !== -1)
            waitingPlayers.splice(idx, 1);
    });

});
