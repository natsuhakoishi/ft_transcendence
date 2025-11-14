import type { FastifyPluginAsync } from "fastify";
import { LocalRoom, LocalRoomManager } from "../../share/type/localRoomData.ts";
import type { Player, PlayerWithProfileData } from "../../share/type/Player.ts";
import type { MatchPlayersData } from "../../share/type/Matches.ts";
import { keyLogic, start } from "./gameLogic.ts";

const LocalGameplay: FastifyPluginAsync = async(fastify: any) => {
    const rooms: LocalRoomManager = fastify.AIrooms;

    fastify.get("/matching", { websocket: true }, (connection: any, req) => {
        const ws = connection;

        ws.on("message", (msg: any) => {
            (async () => {
                const playerProfile: PlayerWithProfileData = JSON.parse(msg.toString());
                console.log("/game/AI/matching: ", playerProfile);

                rooms.createRoom(playerProfile.id);

                const matchPlayersData: MatchPlayersData = {
                    roomID: "",
                    Players: [
                        {id: playerProfile.id, avatar: "default.webp", name: "🐱"},
                        {id: 0, avatar: "yugiri_dev.webp", name: "🐌"}
                    ]
                };
                ws.send(JSON.stringify(matchPlayersData));
            })()
        });
    });

    fastify.get("/gameplay", { websocket: true }, (connection: any, req: any) => {
        const ws = connection;

        ws.on("message", (m: any) => {
            const data: { playerId: number, keyPress: string} = JSON.parse(m.toString());
            const {playerId, keyPress} = data;

            console.log("local: ", m.toString());
            console.log("local: ", data);
            const localRooms: LocalRoomManager = fastify.localRooms;
            let room: LocalRoom | undefined = localRooms.getRoom(playerId);
            if (!room)
            {
                try {
                    localRooms.createRoom(playerId);
                    room = localRooms.getRoom(playerId);
                    console.log("create room success");
                }
                catch (e: any)
                {
                    console.error(e);
                    ws.send(JSON.stringify({type: "Error"}));
                    return ;
                }
            }
            const player: Player = {id: playerId, ws: ws};
            handleKeyPressLocal(keyPress, player, room);

            if (room?.getConfirm() && !room.getState().gamingStage)
                start(room, () => localRooms.deleteRoom(player.id), null);
        })
    });
};

function handleKeyPressLocal(keyPress: string, player: Player, room?: LocalRoom): void {
    if (!room)
        return ;
    if (keyPress === "init")
        room.addPlayer(player);
    else if (keyPress === "Enter" && !room.getState().gamingStage)
        room.setConfirm();
    else
        keyLogic(room!, keyPress, player.id === 0 ? "left" : "right");

}

export default LocalGameplay;
