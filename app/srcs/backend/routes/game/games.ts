import type { FastifyPluginAsync } from "fastify";
import type { GameData } from "../../share/type/gameData";
import { Room, RoomManager } from "../../share/type/roomData.ts";
import { Trespassing } from "./gameUtils.ts";
import { handleKeyPress, start } from "./gameLogic.ts";
import type { Player } from "../../share/type/roomData.ts";
import { createMatch } from "../../database/match.ts";
import type { GameScore } from "../../share/type/gameState.ts";

const games: FastifyPluginAsync = async (fastify: any) => {
    const rooms: RoomManager = new RoomManager();

    fastify.post("/gameplay", async (request, reply) => {
        const data: GameData = request.body as GameData;

        console.log("gameplay(post): receive message from player", data);

        //TODO: save data.
        rooms.createRoom(data.roomId, data.gameState);
        return { status: "ok", received: data };
    });

    fastify.get("/gameplay", { websocket: true }, (connection: any, req) => {
        const ws = connection;

        console.log("/gameplay: connected");

        ws.on("message", (msg) => {
            console.log("/gameplay: received message from player");

            const data: GameData = JSON.parse(msg.toString());
            const player: Player = { id: data.playerId, ws: ws };
            // console.log("/gameplay: ", data);

            const room: Room | null = rooms.getRoom(data.roomId);
            console.log("/gameplay check trespassing");
            if (!room) {
                Trespassing(data.gameState, ws);
                return ;
            }
            handleKeyPress(room, data, player);

            if (room.size() === 2 && !room.getState().gamingStage)
                start(room, () => {
                    const score: GameScore = room.getState().score;
                    try {
                        createMatch(room.p1ID(), room.p2ID(), score.p1Score, score.p2Score, false);
                        console.log("/gameplay: call database success");
                    }
                    catch (e) {
                        console.log(e);
                    }
                    rooms.removeRoom(room.getRoomID());
                });
        });

        ws.on("close", () =>
        {
            console.log("/gameplay(get): player disconnected");
        });
    });


};

export default games;