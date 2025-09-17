import type { FastifyPluginAsync } from "fastify";
import { Player } from "../../share/type/roomData";

const waitingPlayers: Player[] = [];
const waitingTPlayers: Player[] = [];

const match: FastifyPluginAsync = async(fastify: any) => {
    fastify.get("/gamematching", { websocket: true }, (connection: any, req) => {
        const ws = connection;

        console.log("/gamematching connected");

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

                console.log("/gamematching: tmp room id: " + TmpRoomID);
                console.log(`/gamematching: Matched players: ${p1.id} vs ${p2.id}`);
            }
        });

        ws.on("close", () => {
            const idx = waitingPlayers.findIndex(p => p.ws === ws);

            console.log("/gamematching: player disconnected")
            if (idx !== -1)
                waitingPlayers.splice(idx, 1);
        });
    });

    fastify.get("/TMatching", {websocket: true}, (connection: any, req) => {
        const ws = connection;

        ws.on("message", msg => {
            const playerID: number = parseInt(msg.toString(), 10);

            waitingTPlayers.push({id: playerID, ws});

            if (waitingTPlayers.length >= 4)
            {
                const p1: Player = waitingTPlayers.shift()!;
                const p2: Player = waitingTPlayers.shift()!;
                const p3: Player = waitingTPlayers.shift()!;
                const p4: Player = waitingTPlayers.shift()!;

                const roomID: string = createTRoomID(p1.id, p2.id, p3.id, p4.id);

                p1.ws.send(roomID);
                p2.ws.send(roomID);
                p3.ws.send(roomID);
                p4.ws.send(roomID);

                console.log("/gamematching: tmp room id: " + roomID);
                console.log(`/gamematching: Matched players: ${p1.id} vs ${p2.id} vs ${p3.id} vs ${p4.id}`);
            }
        });

        ws.on("close", () => {
            const idx = waitingTPlayers.findIndex(p => p.ws === ws);

            console.log("/TMatching: player disconnected")
            if (idx !== -1)
                waitingTPlayers.splice(idx, 1);
        });

    });
}

function createRoomID(p1: number, p2: number): string {
    return p1 > p2 ? `${p2}-${p1}` : `${p1}-${p2}`;
}

function createTRoomID(p1: number, p2: number, p3: number, p4: number): string {
    const N = [p1, p2, p3, p4];
    N.sort();
    return `${N[0]}-${N[1]}-${N[2]}-${N[3]}`;
}

export default match;
