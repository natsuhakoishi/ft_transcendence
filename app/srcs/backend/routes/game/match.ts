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

                if (p1.id === p2.id)
                {
                    console.log("/Matching :same player in one match");
                    p1.ws.send(JSON.stringify({success: false}));
                    p2.ws.send(JSON.stringify({success: false}));
                }
                else
                {
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
    
                    p1.ws.send(JSON.stringify({success: true, data: matchPlayersData}));
                    p2.ws.send(JSON.stringify({success: true, data: matchPlayersData}));
    
                    console.log("/gamematching: tmp room id: " + TmpRoomID);
                    console.log(`/gamematching: Matched players: ${p1.id} vs ${p2.id}`);
                }
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
    
                    const players: Player[] = [p1, p2, p3, p4];
                    const set = new Set<number>();
                    let ok: boolean = true;
                    for (const player of players)
                    {
                        if (set.has(player.id))
                        {
                            console.log("/TMatching :same player in one match");
                            ok = false;
                            break ;
                        }
                        set.add(player.id);
                    }

                    if (!ok) {
                        const m = JSON.stringify({success: false});
                        players.forEach((player) => {
                            player.ws.send(m);
                        })
                    }
                    else
                    {
                        const roomID: string = createTRoomID([p1.id, p2.id, p3.id, p4.id]);
    
                        await fastify.tournamentRooms.createTRoom([p1.id, p2.id, p3.id, p4.id]);

                        const m = JSON.stringify({success: true, RoomId: roomID});
                        players.forEach((player) => {
                            player.ws.send(m);
                        })
        
                        console.log("/TMatching: tmp room id: " + roomID);
                        console.log(`/TMatching: Matched players: ${p1.id} & ${p2.id} & ${p3.id} & ${p4.id}`);
                    }
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
