import type { FastifyPluginAsync } from "fastify";
import { LocalRoom, LocalRoomManager } from "../../share/type/localRoom.ts";
import { keyLogic, start } from "./gameLogic.ts";
import type { MatchPlayersData } from "../../share/type/Matches.ts";
import type { LocalGameData } from "../../share/type/gameData.ts";
import type { LocalTRoom, LocalTRoomManager } from "../../share/type/localTournamentRoom.ts";
import type { GameScore } from "../../share/type/gameState.ts";

const LocalGameplay: FastifyPluginAsync = async(fastify: any) => {
    const rooms: LocalRoomManager = fastify.localRooms;

    fastify.get("/matching", { websocket: true }, (connection: any, req) => {
        const ws = connection;

        ws.on("message", (msg: any) => {
            (async () => {
                const playersData: MatchPlayersData = JSON.parse(msg.toString());
                console.log("/local/matching: ", playersData);
                if (!playersData.Players[0].name || !playersData.Players[1].name)
                {
                    ws.send(JSON.stringify({success: false}));
                    return ;
                }

                // playersData.Players.sort((a, b) => a.name!.localeCompare(b.name!));

                try {
                    rooms.createRoom(Number(playersData.roomID), 
                        playersData.Players[0].name,
                        playersData.Players[1].name
                    );
                    ws.send(JSON.stringify({
                        success: true,
                        playersData: playersData
                    }));
                    console.log("local matching sent:", playersData);
                }
                catch (e: any) {
                    console.error("local matching: ", e);
                    ws.send(JSON.stringify({success: false}));
                }
            })()
        });
    });

    fastify.get("/gameplay", { websocket: true }, (connection: any, req: any) => {
        const ws = connection;

        ws.on("message", (m: any) => {
            const data: {pos: string, data: LocalGameData} = JSON.parse(m.toString());
            console.log("local: ", data);
            const {playerId, keyPress, playerName} = data.data;

            let room: LocalRoom | undefined = rooms.getRoom(playerId, playerName);
            if (!room)
            {
                console.log("/local: trespassing");
                ws.send(JSON.stringify({type: "trespassing"}));
                return ;
            }
            if (keyPress === "init")
                room.addPlayer({id: playerId, ws: ws});
            handleKeyPressLocal(keyPress, room.leftOrRight(playerName), room);

            if (room.getConfirm() && !room.getState().gamingStage)
                start(room, () => {
                        if (data.data.tournament)
                        {
                            console.log("local gameplay tournament flag: ", playerId);
                            const trooms: LocalTRoomManager = fastify.localTournamentRooms;
                            const troom: LocalTRoom | null = trooms.getRoomByPlayerID(playerId);
                            if (!troom)
                            {
                                console.log("local gameplay tournament flag: troom not found ");
                                ws.send(JSON.stringify({type: "trespassing"}));
                            }
                            else 
                            {
                                const score: GameScore = room.getState().score;
                                troom.updateWinnerNLoser(playerName, score.p1Score, score.p2Score);
                                console.log("local gameplay tournament flag: update score", playerName);
                            }
                        }
                        rooms.deleteRoom(playerId);
                    }
                , null);
        })

        ws.on("close", () =>
        {
            console.log("/Local: player disconnected");
        });
    });
};

function handleKeyPressLocal(keyPress: string, pos:  "left" | "right" | "?", room: LocalRoom): void {
    if (pos === "?")
        return ;
    if (keyPress === "Enter" && !room.getState().gamingStage)
        room.setConfirm();
    else
        keyLogic(room, keyPress, pos);
}

export default LocalGameplay;
