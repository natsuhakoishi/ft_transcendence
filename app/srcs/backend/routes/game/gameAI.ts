import type { FastifyPluginAsync } from "fastify";
import type { GameData } from "../../share/type/gameData.ts";
import type { Player } from "../../share/type/Player.ts";
import { AIRoom } from "../../share/type/AIroomData.ts";
import { handleKeyPressAI} from "./AIGameLogic.ts";
import { start } from "./gameLogic.ts";

const AI: FastifyPluginAsync = async (fastify: any) => {
    // const rooms: RoomManager = new RoomManager();

    fastify.get("/matching", { websocket: true }, (connection: any, req: any) => {
        const ws = connection;

        ws.on("message", (msg: any) => {
            const {id}: {id: number} = JSON.parse(msg.toString());

            fastify.AIRooms.createRoom(id);
        });

    });

    fastify.get("/gameplay", { websocket: true }, (connection: any, req: any) => {
        const ws = connection;

        ws.on("message", (msg: any) => {
            const parse: GameData = JSON.parse(msg.toString());

            const player: Player = {id: parse.playerId, ws: ws};

            const room: AIRoom = fastify.AIRooms.getRoom(parse.playerId);

            console.log("AI: keypress ", parse.keyPress);
            handleKeyPressAI(parse.keyPress, room, player);

            if (room.getConfirm())
                start(room, () => fastify.AIRooms.deleteRoom(player.id));
        })

        ws.on("close", () =>
        {
            console.log("/AI: player disconnected");
        });
    });
}

export default AI;