import WebSocket, { WebSocketServer } from "ws";

interface Player {
    id: number;
    ws: WebSocket;
}

const wss = new WebSocketServer({ port: 8080 });
const waitingPlayers: Player[] = [];

//wss = server
//ws = every clients
wss.on('connection', (ws) => {
    console.log("connected");

    ws.on("message", msg => {
        const playerID: number = parseInt(msg.toString(), 10);

        console.log("Waiting player: " + msg.toString());
        waitingPlayers.push({ id: playerID, ws});

        console.log("waiting count: " + waitingPlayers.length.toString());
        if (waitingPlayers.length >= 2)
        {
            const p1: Player = waitingPlayers.shift()!;
            const p2: Player = waitingPlayers.shift()!;

            const TmpRoomID: string = createRoomID(p1.id, p2.id);

            p1.ws.send(TmpRoomID);
            p2.ws.send(TmpRoomID);

            console.log("tmp room id: " + TmpRoomID);
            console.log(`Matched players: ${p1.id} vs ${p2.id}`);
        }
    });

    ws.on("close", () => {
        const idx = waitingPlayers.findIndex(p => p.ws === ws);

        console.log("player disconnected")
        if (idx !== -1)
            waitingPlayers.splice(idx, 1);
    });

});

function createRoomID(p1: number, p2: number): string {
    return p1 > p2 ? `${p2}-${p1}` : `${p1}-${p2}`;
}
