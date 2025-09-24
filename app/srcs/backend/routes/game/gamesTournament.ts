import type { FastifyPluginAsync } from "fastify";
import type { GameData } from "../../share/type/gameData.ts";
import type { TRoom } from "../../share/type/tournamentRoomData.ts";
import { createRoomID, initTData } from "./gameUtils.ts";
import type { Matches } from "../../share/type/Matches.ts";
import type { Player } from "../../share/type/Player.ts";

const gamesTournament: FastifyPluginAsync = async (fastify: any) => {
    fastify.get("/gameplay", { websocket: true }, (connection: any, req) => {
        const ws = connection;
        let count = 0;
        console.log("/tournament/gameplay: connected");

        ws.on("message", (msg) => {
            console.log("/tournament/gameplay: receive message from player", msg.toString());
            const data: GameData = JSON.parse(msg.toString());
            const player: Player = { id: data.playerId, ws: ws };

            const room: TRoom | null = fastify.tournamentRooms.getRoomByPlayerID(data.playerId);
            if (!room)
            {
                ws.send(JSON.stringify({ type: "trespassing", data: initTData()}));
                return ;
            }
            if (data.keyPress === "init" && room.size() < 4)
                room.addPlayer(player);

            if (room.size() === 4) {
                if (!room.getStatus())
                {
                    room.makeRound1();
                    const round1: Matches = room.getData().round1;
                    const players: [Player[],Player[]] = room.getData().round1.matches;
                    const AGroup: Player[] = players[0];
                    const BGroup: Player[] = players[1];
                    fastify.rooms.createRoom(AGroup[0].id, AGroup[1].id);
                    fastify.rooms.createRoom(BGroup[0].id, BGroup[1].id);
                    round1.roomID[0] = createRoomID(AGroup[0].id, AGroup[1].id);
                    round1.roomID[1] = createRoomID(BGroup[0].id, BGroup[1].id);

                    room.broadCast("update");
                    setTimeout(() => {
                        room.startRound1();
                    }, 1000 * 3);
                }
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
    
                        fastify.rooms.createRoom(AGroup[0].id, AGroup[1].id);
                        fastify.rooms.createRoom(BGroup[0].id, BGroup[1].id);

                        setTimeout(() => {
                            room.broadCast("update");
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
                    fastify.tournamentRooms.removeRoom(data.roomId);
                    //TODO: send result / leaderboard to players
                }
            }
        });

        ws.on("close", () =>
        {
            console.log("/tournament/gameplay: player disconnected");
        });
    });
}

export default gamesTournament;