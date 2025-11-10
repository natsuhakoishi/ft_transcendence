import type { FastifyPluginAsync } from "fastify";
import type { GameData } from "../../share/type/gameData.ts";
import { Room } from "../../share/type/roomData.ts";
import { Trespassing } from "./gameUtils.ts";
import { handleKeyPress, start } from "./gameLogic.ts";
import { createMatch } from "../../database/match.ts";
import type { GameScore } from "../../share/type/gameState.ts";
import type { Player } from "../../share/type/Player.ts";
import { TRoom } from "../../share/type/tournamentRoomData.ts";

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

            fastify.rooms.showRooms();
            const room: Room | null = fastify.rooms.getRoomByPlayerID(player.id);
            console.log("/gameplay check trespassing", player.id, (room ? "ok" : "tps"));
            if (!room) {
                if (data.keyPress !== "stop" || data.playerId != 0)
                    Trespassing(ws);
                return ;
            }
            handleKeyPress(room, data, player);

            let Troom: TRoom | null = null;
            if (data.tournament)
                Troom = fastify.tournamentRooms.getRoomByPlayerID(room.getP1ID());
            if (room.getConfirm() === 2 && !room.getState().gamingStage)
                start(room, () => {
                    const score: GameScore = room.getState().score;
                    try {
                        ( async () => {
                            console.log("/gameplay: call database success");
                            if (data.tournament)
                            {
                                if (Troom && !Troom.checkOffline())
                                {
                                    const MatchID: number = await createMatch(room.getP1ID(), room.getP2ID(), score.p1Score, score.p2Score, data.tournament);
                                    Troom.updateWinnerNLoser(room.getP1ID(), MatchID, score.p1Score, score.p2Score);
                                }
                            }
                            else if (!data.tournament)
                                await createMatch(room.getP1ID(), room.getP2ID(), score.p1Score, score.p2Score, data.tournament);
                        })()
                    }
                    catch (e) {
                        console.log(e);
                    }
                    fastify.rooms.removeRoom(room.getRoomID());
                }, Troom);
        });

        ws.on("close", () =>
        {
            console.log("/gameplay: player disconnected");
        });
    });

};

export default games;