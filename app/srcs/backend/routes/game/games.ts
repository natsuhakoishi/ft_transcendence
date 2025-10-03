import type { FastifyPluginAsync } from "fastify";
import type { GameData } from "../../share/type/gameData.ts";
import { Room, RoomManager } from "../../share/type/roomData.ts";
import { Trespassing } from "./gameUtils.ts";
import { handleKeyPress, start } from "./gameLogic.ts";
import { createMatch } from "../../database/match.ts";
import type { GameScore } from "../../share/type/gameState.ts";
import type { Player } from "../../share/type/Player.ts";

const games: FastifyPluginAsync = async (fastify: any) => {
    // const rooms: RoomManager = new RoomManager();

    fastify.get("/gameplay", { websocket: true }, (connection: any, req: any) => {
        const ws = connection;

        console.log("/gameplay: connected");

        ws.on("message", (msg: any) => {
            console.log("/gameplay: received message from player");

            const data: GameData = JSON.parse(msg.toString());
            const player: Player = { id: data.playerId, ws: ws };
            console.log("/gameplay: ", data);

            const room: Room | null = fastify.rooms.getRoomByPlayerID(player.id);
            console.log("/gameplay check trespassing");
            if (!room) {
                Trespassing(ws);
                return ;
            }
            handleKeyPress(room, data, player, () => {
                room.mandatoryWin();
                console.log("/gameplay: timeout");
                room.broadCast("timeout");

                setTimeout(() => {
                    setTimeout(() => {
                        fastify.rooms.removeRoom(room.getRoomID());
                    }, 1000 * 2);
                }, 1000 * 3);
            });

            if (room.size() === 2 && !room.getState().gamingStage)
                start(room, () => {
                    const score: GameScore = room.getState().score;
                    try {
                        createMatch(room.getP1ID(), room.getP2ID(), score.p1Score, score.p2Score, data.tournament);
                        console.log("/gameplay: call database success");
                        if (data.tournament)
                            fastify.tournamentRooms.getRoomByPlayerID(room.getP1ID()).updateWinnerNLoser(room.getP1ID(), score.p1Score, score.p2Score);
                    }
                    catch (e) {
                        console.log(e);
                    }
                    fastify.rooms.removeRoom(room.getRoomID());
                });
        });

        ws.on("close", () =>
        {
            console.log("/gameplay(get): player disconnected");
        });
    });


};

export default games;