import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { WebSocket } from "ws"; // 直接用 ws 的类型
import { GameData } from "../../share/type/gameData"

const fastify = Fastify();
await fastify.register(websocket);

fastify.get("/game", { websocket: true }, (connection: any, req) => {
    const ws: WebSocket = connection.socket;
    console.log("/game connected");

    ws.on("message", (msg) => {
        console.log("receive message from client", msg.toString());

        let data: GameData = JSON.parse(msg.toString());
        console.log("player id:" + data.userId.toString());
        console.log("player pressed" + data.keyPress);

        // wss.clients.forEach(client => {
        //     if (client.readyState === ws.OPEN)
        //         client.send("server received: " + msg.toString());
        // });
    });

    ws.on("close", () => console.log("client disconnected"));
    
})

//matching----------------
interface Player {
    id: number;
    ws: WebSocket;
}

const waitingPlayers: Player[] = [];

fastify.get("/match", { websocket: true }, (connection: any, req) => {
    const ws: WebSocket = connection.socket;
   console.log("/match connected");

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
    
})

function createRoomID(p1: number, p2: number): string {
    return p1 > p2 ? `${p2}-${p1}` : `${p1}-${p2}`;
}


await fastify.listen({ port: 3000 });