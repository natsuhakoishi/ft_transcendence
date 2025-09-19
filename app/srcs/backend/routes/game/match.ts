import type { FastifyPluginAsync } from "fastify";
import type { Player } from "../../share/type/roomData";
import { createRoomID, createTRoomID } from "./gameUtils.ts";

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

                fastify.rooms.createRoom(p1.id, p2.id);
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

                const roomID: string = createTRoomID([p1.id, p2.id, p3.id, p4.id]);

                fastify.tournamentRooms.createTRoom([p1.id, p2.id, p3.id, p4.id]);

                p1.ws.send(roomID);
                p2.ws.send(roomID);
                p3.ws.send(roomID);
                p4.ws.send(roomID);

                console.log("/TMatching: tmp room id: " + roomID);
                console.log(`/TMatching: Matched players: ${p1.id} & ${p2.id} & ${p3.id} & ${p4.id}`);
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


export default match;
