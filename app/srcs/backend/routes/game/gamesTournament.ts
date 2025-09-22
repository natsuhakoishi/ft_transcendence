import type { FastifyPluginAsync } from "fastify";
import type { GameData } from "../../share/type/gameData.ts";
import type { Matches, TRoom } from "../../share/type/tournamentRoomData.ts";
import { createRoomID, initTData } from "./gameUtils.ts";
import type { Player } from "../../share/type/roomData.ts";

const gamesTournament: FastifyPluginAsync = async (fastify: any) => {
    fastify.get("/gameplay", { websocket: true }, (connection: any, req) => {
        const ws = connection;
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
            if (data.keyPress === "Enter" && !room.getStatus() && room.size() < 4)
                room.addPlayer(player);

            if (room.size() === 4) {
                room.makeRound1();
                const round1: Matches = room.getData().round1;
                const players: [Player[],Player[]] = room.getData().round1.matches;
                const AGroup: Player[] = players[0]; 
                const BGroup: Player[] = players[1]; 
                fastify.rooms.createRoom(AGroup[0].id, AGroup[1].id);
                fastify.rooms.createRoom(BGroup[0].id, BGroup[1].id);
                round1.roomID[0] = createRoomID(AGroup[0].id, AGroup[1].id);
                round1.roomID[1] = createRoomID(BGroup[0].id, BGroup[1].id);
                room.startRound1();
                
            }
        });

        ws.on("close", () =>
        {
            console.log("/tournament/gameplay: player disconnected");
        });
    });
}

export default gamesTournament;