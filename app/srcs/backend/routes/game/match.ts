import type { FastifyPluginAsync } from "fastify";

//matching----------------
interface Player {
    id: number;
    ws: any;
}

const waitingPlayers: Player[] = [];

const match: FastifyPluginAsync = async(fastify: any) => {
    fastify.get("/match", { websocket: true }, (connection: any, req) => {
        const ws = connection;

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

                console.log("/match: tmp room id: " + TmpRoomID);
                console.log(`/match: Matched players: ${p1.id} vs ${p2.id}`);
            }
        });

        ws.on("close", () => {
            const idx = waitingPlayers.findIndex(p => p.ws === ws);

            console.log("/match: player disconnected")
            if (idx !== -1)
                waitingPlayers.splice(idx, 1);
        });
    })
}

function createRoomID(p1: number, p2: number): string {
    return p1 > p2 ? `${p2}-${p1}` : `${p1}-${p2}`;
}

export default match;
