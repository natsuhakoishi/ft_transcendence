import type { FastifyPluginAsync } from "fastify";
import type { GameData, localTData } from "../../share/type/gameData.ts";
import { createRoomID } from "./gameUtils.ts";
import type { Matches, MatchPlayersData } from "../../share/type/Matches.ts";
import type { Player, PlayerWithProfileData } from "../../share/type/Player.ts";
import { LocalTRoom, LocalTRoomManager } from "../../share/type/localTournamentRoom.ts";

const localTournament: FastifyPluginAsync = async (fastify: any) => {
    const rooms: LocalTRoomManager = fastify.localTournamentRooms;

    fastify.get("/matching", { websocket: true }, (connection: any, req: any) => {
        const ws = connection;

        ws.on("message", (msg: any) => {
            (async () => {
                const data: {id: number, playersProfile: PlayerWithProfileData[]} = JSON.parse(msg.toString());
                const { id, playersProfile } = data;
                console.log("/game/local/tournament/matching: ", playersProfile);

                if (!playersProfile || playersProfile.length != 4)
                {
                    ws.send(JSON.stringify({success: false}));
                    return ;
                }

                try {
                    rooms.createTRoom(id, playersProfile);
                    const matchPlayersData: MatchPlayersData = {
                        roomID: id.toString(),
                        Players: playersProfile
                    };

                    ws.send(JSON.stringify({success: true, id: id}));
                }
                catch (e: any)
                {
                    console.log("local TMatching: ", e);
                    ws.send(JSON.stringify({success: false}));
                }

            })()
        });
    });

    fastify.get("/gameplay", { websocket: true }, (connection: any, req) => {
        const ws = connection;
        console.log("local/tournament/gameplay: connected");

        ws.on("message", (msg) => {
            console.log("local/tournament/gameplay: receive message from player", msg.toString());
            const data: GameData = JSON.parse(msg.toString());
            const player: Player = { id: data.playerId, ws: ws };

            const room: LocalTRoom | null = rooms.getRoomByPlayerID(data.playerId);
            if (!room)
            {
                if (data.keyPress === "over")
                    return ;
                console.log("local/tournament/gameplay: trespassing");
                ws.send(JSON.stringify({ type: "trespassing" }));
                return ;
            }
            if (data.keyPress === "init")
                room.addPlayer(player);

            if (!room.getStatus())
                room.makeRound1();
            else if (room.getData().matchCount > 2)
                room.makeRound2();
            if (room.getData().matchCount < 2 && data.keyPress === "over")
                handleRound1(room, rooms, data.playerId);
            else if (room.getStatus() === "round2" && data.keyPress === "over")
            {
                room.makeRound2();
                const round2: Matches = room.getData().round2;
                if (round2.roomID.length === 0)
                {
                    const AGroup: Player[] = room.getR1Winners();
                    const BGroup: Player[] = room.getR1Losers();
                    round2.roomID[0] = createRoomID(AGroup[0].id, AGroup[1].id);
                    round2.roomID[1] = createRoomID(BGroup[0].id, BGroup[1].id);

                    fastify.rooms.createRoom(AGroup[0].id, AGroup[1].id, 20);
                    fastify.rooms.createRoom(BGroup[0].id, BGroup[1].id, 20);

                    fastify.rooms.showRooms();
                    setTimeout(() => {
                        room.broadCast("update", "r2");
                        setTimeout(() => {
                            room.startRound2();
                        }, 1000 * 5);
                    }, 1000 * 5);
                }
            }
            else if (room.getStatus() === "end" && data.keyPress === "over")
            {
                console.log("tournament/gameplay: end");
                room.broadCast("end");
                rooms.removeRoom(data.playerId);
            }
        });

        ws.on("close", () =>
        {
            console.log("local/tournament/gameplay: player disconnected");
        });
    });
}

function handleRound1(room: LocalTRoom, rooms: LocalTRoomManager, id: number): void
{
    const data: localTData = room.getData();

    if (data.matchCount === 0)
    {
        const group1: MatchPlayersData = data.round1[0];

        group1.roomID = id.toString();
        data.round1[1].roomID = id.toString();;

        rooms.createTRoom(id, group1.Players);

        room.broadCast("update", "r1");
        setTimeout(() => {
            room.startRound();
        }, 1000 * 3);
    }
    else
    {
        const group2: MatchPlayersData = data.round1[1];
        const players2: PlayerWithProfileData[] = group2.Players;

        rooms.createTRoom(id, players2);
        room.startRound();
    }
}

export default localTournament;