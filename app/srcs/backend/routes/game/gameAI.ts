import type { FastifyPluginAsync } from "fastify";
import type { GameData } from "../../share/type/gameData.ts";
import type { Player, PlayerWithProfileData } from "../../share/type/Player.ts";
import type { AIRoom, AIRoomManager } from "../../share/type/AIroomData.ts";
import { handleKeyPressAI} from "./AIGameLogic.ts";
import { start } from "./gameLogic.ts";
import type { MatchPlayersData } from "../../share/type/Matches.ts";
import { initGameState } from "./gameUtils.ts";

const AI: FastifyPluginAsync = async (fastify: any) => {
    const AIrooms: AIRoomManager = fastify.AIrooms;

    fastify.get("/matching", { websocket: true }, (connection: any, req: any) => {
        const ws = connection;

        ws.on("message", (msg: any) => {
            (async () => {
                const playerProfile: PlayerWithProfileData = JSON.parse(msg.toString());
                console.log("/game/AI/matching: ", playerProfile);

                AIrooms.createRoom(playerProfile.id);

                const matchPlayersData: MatchPlayersData = {
                    roomID: "",
                    Players: [
                        {id: playerProfile.id, avatar: playerProfile.avatar, name: playerProfile.name},
                        {id: 0, avatar: "default.webp", name: "Ai chan"}
                    ]
                };

                ws.send(JSON.stringify(matchPlayersData));
            })()
        });
    });

    fastify.get("/gameplay", { websocket: true }, (connection: any, req: any) => {
        const ws = connection;

        ws.on("message", (msg: any) => {
            const parse: GameData = JSON.parse(msg.toString());

            const player: Player = {id: parse.playerId, ws: ws};

            console.log("/game/AI/gameplay: ", parse);
            const room: AIRoom | null = fastify.AIrooms.getRoom(parse.playerId);
            if (!room)
            {
                console.log("/game/AI/gameplay: trespassing", player.id);
                ws.send(JSON.stringify({type: "trespassing", gameState: initGameState()}));
                return ;
            }
            console.log("AI: keypress ", parse.keyPress);
            handleKeyPressAI(parse.keyPress, room, player);

            if (room.getConfirm() && !room.getState().gamingStage)
                start(room, () => fastify.AIrooms.deleteRoom(player.id));
        })

        ws.on("close", () =>
        {
            console.log("/AI: player disconnected");
        });
    });
}

export default AI;