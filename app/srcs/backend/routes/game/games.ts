import type { FastifyPluginAsync } from "fastify";
import type { GameData } from "../../share/type/gameData";
import { Room, RoomManager } from "../../share/type/roomData.ts";
import { Trespassing } from "./gameUtils.ts";
import { handleKeyPress, start } from "./gameLogic.ts";
import type { Player } from "../../share/type/roomData.ts";
import { createMatch } from "../../database/match.ts";
import type { GameScore } from "../../share/type/gameState.ts";

const games: FastifyPluginAsync = async (fastify: any) => {
    // const rooms: RoomManager = new RoomManager();

    fastify.get("/gameplay", { websocket: true }, (connection: any, req) => {
        const ws = connection;

        console.log("/gameplay: connected");

        ws.on("message", (msg) => {
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
            handleKeyPress(room, data, player);

            if (room.size() === 2 && !room.getState().gamingStage)
                start(room, () => {
                    const score: GameScore = room.getState().score;
                    try {
                        createMatch(room.getP1ID(), room.getP2ID(), score.p1Score, score.p2Score, data.tournament);
                        console.log("/gameplay: call database success");
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