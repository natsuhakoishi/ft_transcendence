import type { FastifyPluginAsync } from "fastify";
import { createRoomID, createTRoomID } from "./gameUtils.ts";
import type { Player, PlayerWithProfileData } from "../../share/type/Player.ts";
import type { MatchPlayersData } from "../../share/type/Matches.ts";

const waitingPlayers: PlayerWithProfileData[] = [];
const waitingTPlayers: PlayerWithProfileData[] = [];

const match: FastifyPluginAsync = async(fastify: any) => {
    fastify.get("/gamematching", { websocket: true }, (connection: any, req) => {
        const ws = connection;

        console.log("/gamematching connected");

        ws.on("message", msg => {
            const data: PlayerWithProfileData = JSON.parse(msg.toString());

            const playerID: number = data.id;
            console.log("Waiting player: " + msg.toString());
            waitingPlayers.push({ id: playerID, avatar: data.avatar, name: data.name, ws});

            console.log("waiting count: " + waitingPlayers.length.toString());
            if (waitingPlayers.length >= 2)
            {
                const p1: PlayerWithProfileData = waitingPlayers.shift()!;
                const p2: PlayerWithProfileData = waitingPlayers.shift()!;

                fastify.rooms.createRoom(p1.id, p2.id);
                const TmpRoomID: string = createRoomID(p1.id, p2.id);

                const matchPlayersData: MatchPlayersData = {
                    roomID: TmpRoomID,
                    Players: [
                        {id: p1.id, avatar: p1.avatar, name: p1.name},
                        {id: p2.id, avatar: p2.avatar, name: p2.name}
                    ]
                };


                matchPlayersData.Players.sort((a, b) => a.id - b.id );
                console.log("/gamematching: matchPlayersData", matchPlayersData);

                p1.ws.send(JSON.stringify(matchPlayersData));
                p2.ws.send(JSON.stringify(matchPlayersData));

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
            ( async () => {
                const playerID: number = parseInt(msg.toString(), 10);
    
                waitingTPlayers.push({id: playerID, ws});
    
                if (waitingTPlayers.length >= 4)
                {
                    const p1: Player = waitingTPlayers.shift()!;
                    const p2: Player = waitingTPlayers.shift()!;
                    const p3: Player = waitingTPlayers.shift()!;
                    const p4: Player = waitingTPlayers.shift()!;
    
                    const roomID: string = createTRoomID([p1.id, p2.id, p3.id, p4.id]);

                    await fastify.tournamentRooms.createTRoom([p1.id, p2.id, p3.id, p4.id]);
    
                    p1.ws.send(roomID);
                    p2.ws.send(roomID);
                    p3.ws.send(roomID);
                    p4.ws.send(roomID);
    
                    console.log("/TMatching: tmp room id: " + roomID);
                    console.log(`/TMatching: Matched players: ${p1.id} & ${p2.id} & ${p3.id} & ${p4.id}`);
                }
            })()
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
