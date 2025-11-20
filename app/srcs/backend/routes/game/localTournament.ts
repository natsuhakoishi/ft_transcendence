import type { FastifyPluginAsync } from "fastify";
import type { GameData, localTData } from "../../share/type/gameData.ts";
import type { MatchPlayersData } from "../../share/type/Matches.ts";
import type { Player, PlayerWithProfileData } from "../../share/type/Player.ts";
import { LocalTRoom, LocalTRoomManager } from "../../share/type/localTournamentRoom.ts";
import { LocalRoomManager } from "../../share/type/localRoom.ts";

const localTournament: FastifyPluginAsync = async (fastify: any) => {
    const rooms: LocalTRoomManager = fastify.localTournamentRooms;

    fastify.get("/matching", { websocket: true }, (connection: any, req: any) => {
        const ws = connection;

        ws.on("message", (msg: any) => {
            (async () => {
                const data: {id: number, playersProfile: PlayerWithProfileData[]} = JSON.parse(msg.toString());
                const { id, playersProfile } = data;
                console.log("/game/local/tournament/matching: ", playersProfile);

                if (!playersProfile || playersProfile.length != 4)
                {
                    ws.send(JSON.stringify({success: false}));
                    return ;
                }

                try {
                    rooms.createTRoom(id, playersProfile);
                    // const matchPlayersData: MatchPlayersData = {
                    //     roomID: id.toString(),
                    //     Players: playersProfile
                    // };

                    ws.send(JSON.stringify({success: true, id: id}));
                }
                catch (e: any)
                {
                    console.log("local TMatching: ", e);
                    ws.send(JSON.stringify({success: false}));
                }
            })()
        });
    });

    fastify.get("/gameplay", { websocket: true }, (connection: any, req) => {
        const ws = connection;
        console.log("local/tournament/gameplay: connected");

        ws.on("message", (msg) => {
            console.log("local/tournament/gameplay: receive message from player", msg.toString());
            const data: GameData = JSON.parse(msg.toString());
            const player: Player = { id: data.playerId, ws: ws };

            const room: LocalTRoom | null = rooms.getRoomByPlayerID(data.playerId);
            if (!room)
            {
                if (data.keyPress === "over")
                    return ;
                console.log("local/tournament/gameplay: trespassing");
                ws.send(JSON.stringify({ type: "trespassing" }));
                return ;
            }
            if (data.keyPress === "init")
                room.addPlayer(player);

            if (!room.getStatus())
                room.makeRound1();
            else if (room.getStatus() === "round2" && room.getData().matchCount === 2)
                room.makeRound2();

            try {
                if (room.getData().matchCount < 2)
                    handleRound1(room, fastify.localRooms, data.playerId);
                else if (room.getStatus() === "round2")
                    handleRound2(room, fastify.localRooms, data.playerId);
                else if (room.getStatus() === "end" && data.keyPress === "over")
                {
                    console.log("tournament/gameplay: end");
                    room.broadCast("end");
                    rooms.removeRoom(data.playerId);
                }
            }
            catch (e: any)
            {
                console.error(e);
                room.broadCast("Player already have match");
                rooms.removeRoom(data.playerId);
                return ;
            }
        });

        ws.on("close", () =>
        {
            console.log("local/tournament/gameplay: player disconnected");
        });
    });
}

function handleRound1(room: LocalTRoom, rooms: LocalRoomManager, id: number): void
{
    const data: localTData = room.getData();

    if (data.matchCount === 0)
    {
        data.round1[0].roomID = id.toString();;
        data.round1[1].roomID = id.toString();;

        const group1: MatchPlayersData = data.round1[0];
        const players: PlayerWithProfileData[] = group1.Players;

        try {
            rooms.createRoom(id, 
                players[0].name!,
                players[1].name!,
                18
            );
        }
        catch (e: any) {
            console.error(e);
            throw e;
        }

        room.broadCast("update");
        setTimeout(() => {
            room.startRound();
        }, 1000 * 3);
    }
    else
    {
        const group2: MatchPlayersData = data.round1[1];
        const players: PlayerWithProfileData[] = group2.Players;
        try {
            rooms.createRoom(id, 
                players[0].name!,
                players[1].name!,
                18
            );
        }
        catch (e: any) {
            console.error(e);
            throw e;
        }
        setTimeout(() => {
            room.startRound();
        }, 1000 * 3);
        data.state = "r2";
    }
}

function handleRound2(room: LocalTRoom, rooms: LocalRoomManager, id: number): void
{
    const data: localTData = room.getData();

    if (room.getData().matchCount === 2)
    {
        data.round2[0].roomID = id.toString();
        data.round2[1].roomID = id.toString();

        const group1: MatchPlayersData = data.round2[0];
        const players: PlayerWithProfileData[] = group1.Players;
        console.log("check: ", data.round2[0].Players[0].name);
        console.log("check: ", data.round2[0].Players[1].name);
        console.log("check: ", data.round2[1].Players[0].name);
        console.log("check: ", data.round2[1].Players[1].name);
        
        try {
            rooms.createRoom(id, 
                players[0].name!,
                players[1].name!,
                18
            );
        }
        catch (e: any) {
            console.error(e);
            throw e;
        }

        room.broadCast("update");
        setTimeout(() => {
            room.startRound();
        }, 1000 * 3);
    }
    else
    {
        const group2: MatchPlayersData = data.round2[1];
        const players: PlayerWithProfileData[] = group2.Players;
        try {
            rooms.createRoom(id, 
                players[0].name!,
                players[1].name!,
                18
            );
        }
        catch (e: any) {
            console.error(e);
            throw e;
        }
        setTimeout(() => {
            room.startRound();
        }, 1000 * 3);
    }
}

export default localTournament;