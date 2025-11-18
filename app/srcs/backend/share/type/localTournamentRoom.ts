import { initLeaderboard, initLocalTData, TDataWithOutWS } from "../../routes/game/gameUtils.ts";
import type { localTData } from "./gameData.ts";
import fp from "fastify-plugin";
import type { Player, PlayerWithProfileData } from "./Player.ts";
import type { Matches } from "./Matches.ts";
import { addWinLose } from "../../database/profile.ts";
import type { Leaderboard } from "./tournamentRoomData.ts";

export class LocalTRoom {

    private readonly id: number;

    private data: localTData;
    private player: Player;
    private players: PlayerWithProfileData[];

    private status: null | "round1" | "round2"| "end";
    private r1flag: number;
    private r2flag: number;
    private r1winners: PlayerWithProfileData[];
    private r1losers: PlayerWithProfileData[];

    private leaderboard: Leaderboard;

    private offline: boolean = false;
    constructor (playerID: number, playersData: PlayerWithProfileData[]) {
            this.id = playerID;
            this.player = {id: 0, ws: undefined};
            this.players = playersData;
            this.status = null;
            this.r1flag = 0;
            this.r1winners = [];
            this.r1losers = [];
            this.leaderboard = initLeaderboard();
            this.r2flag = 0;
            this.data = initLocalTData(playersData);
    }

    checkOffline(): boolean {
        if (!this.offline)
            if (this.player.ws.readyState !== WebSocket.OPEN)
                    this.offline = true;
        return this.offline;
    }

    broadCast(_type: string, state?: "r1" | "r2"): void {
        const tmp = TDataWithOutWS(this.data, state);
        console.log("broadCast sent: ", tmp, tmp.leaderboard, {first: tmp.leaderboard?.first, second: tmp.leaderboard?.second});
        if (this.player.ws.readyState === WebSocket.OPEN)
            this.player.ws.send(JSON.stringify({type: _type, state: TDataWithOutWS(this.data, state)}));
        else
        {
            console.log("localTRoom: broadCast: offline: ", this.player.id);
            this.offline = true;
        }
    }

    addPlayer(player: Player): void {
            this.player = player;
    }

    checkPlayer(playerName: string): boolean {
        return this.players.some(p => p.name === playerName);
    }

    startRound(): void {
        this.data.matchCount++;
        if (this.data.matchCount <= 2)
            this.data.state = "r1";
        else
            this.data.state = "r2";
        this.broadCast("startRound");
    }

    makeRound1(): void {
        console.log("TGameplay: makeRound1");
        const matches: [PlayerWithProfileData, PlayerWithProfileData][] = this.makeMatches();
        const A: PlayerWithProfileData = matches[0][0];
        const B: PlayerWithProfileData = matches[0][1];
        const C: PlayerWithProfileData = matches[1][0];
        const D: PlayerWithProfileData = matches[1][1];

        this.data.round1 = [
            {
                roomID: "",
                Players:[A, B]
            },
            {
                roomID: "",
                Players: [C, D]
            }
        ];
    }

    makeRound2(): void {
        this.data.round2 = [this.r1winners, this.r1losers];
    }

    private makeMatches(): [PlayerWithProfileData, PlayerWithProfileData][] {

        const arr = this.players;

        for (let i = arr.length - 1; i > 0; i--) { // Fisher-Yates shuffle
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }

        if (arr[0].id > arr[1].id)
            [arr[0], arr[1]] = [arr[1], arr[0]]; //swap
        if (arr[2].id > arr[3].id)
            [arr[2], arr[3]] = [arr[3], arr[2]]; //swap
        return [
            [arr[0], arr[1]],
            [arr[2], arr[3]],
        ];
    }

    updateWinnerNLoser(id: number, matchID: number, p1Score: number, p2Score: number): void {
        if (this.status === "round1" && this.r1flag < 2)
        {
            this.r1flag++;
            const r1: Matches = this.data.round1;
            if (r1.matches[0][0].id === id || r1.matches[0][1].id === id)
                if (p1Score > p2Score)
                    this.addResult(this.r1losers, this.r1winners, r1.matches[0][1], r1.matches[0][0]);
                else
                    this.addResult(this.r1losers, this.r1winners, r1.matches[0][0], r1.matches[0][1]);
            else
                if (p1Score > p2Score)
                    this.addResult(this.r1losers, this.r1winners, r1.matches[1][1], r1.matches[1][0])
                else
                    this.addResult(this.r1losers, this.r1winners, r1.matches[1][0], r1.matches[1][1])
            if (this.r1flag === 2)
                this.status = "round2";
        }
        else if (this.status === "round2" && this.r2flag < 2)
        {
            this.r2flag++;
            const r2: Matches = this.data.round2;
            if (r2.matches[0][0].id === id || r2.matches[0][1].id === id) 
                if (p1Score > p2Score)
                    this.setLeaderboard("first", "second", r2.matches[0][0], r2.matches[0][1]);
                else
                    this.setLeaderboard("first", "second", r2.matches[0][1], r2.matches[0][0]);
            else
                if (p1Score > p2Score)
                    this.setLeaderboard("third", "last", r2.matches[1][0], r2.matches[1][1]);
                else
                    this.setLeaderboard("third", "last", r2.matches[1][1], r2.matches[1][0]);

            if (this.r2flag === 2)
            {
                this.data.leaderboard = this.leaderboard;
                console.log("updateWNL: ", this.data.leaderboard);
                addWinLose(this.leaderboard.first.id, "tournament_wins");
                this.status = "end";

                // console.log("r2 matches data:", r2.matches[0], r2.matches[1]);

            }
        }
        console.log("updateWNL: ", this.r1flag, this.r2flag, this.status);
    }

    setLeaderboard(a: keyof Leaderboard, b: keyof Leaderboard, winner: Player, loser: Player) {
        this.leaderboard[a] = this.data.players[winner.id.toString()];
        this.leaderboard[b] = this.data.players[loser.id.toString()];
    }

    getStatus(): string | null {
        return this.status;
    }

    getData(): localTData {
        return this.data;
    }

    addResult(losers: PlayerWithProfileData[], winners: PlayerWithProfileData[], loser: PlayerWithProfileData, winner: PlayerWithProfileData): void {
        losers.push(loser);
        winners.push(winner);
        if (losers.length === 2)
        {
            losers.sort((a, b) => a.id - b.id );
            winners.sort((a, b) => a.id - b.id );
        }
    }

    getR1Winners(): PlayerWithProfileData[] {
        return this.r1winners;
    }

    getR1Losers(): PlayerWithProfileData[] {
        return this.r1losers;
    }

    getr1Flag(): number {
        return this.r1flag;
    }
}

export class LocalTRoomManager {
    private rooms: Map<number, LocalTRoom>;

    constructor() {
        this.rooms = new Map();
    }

    createTRoom(playerID: number, playersData: PlayerWithProfileData[]): void {
        try {
            if (!this.rooms.has(playerID))
            {
                this.rooms.set(playerID, new LocalTRoom(playerID, playersData));
                const room: LocalTRoom = this.rooms.get(playerID) as LocalTRoom;

                const times = setInterval(() => {
                    if (room.getStatus() === "end")
                        clearInterval(times);
                    if (room.checkOffline())
                    {
                        console.log("/tournament game manager: player offline");
                        room.broadCast("offline");
                        this.removeRoom(playerID);
                        clearInterval(times);
                    }
                }, 1000 * 5); //every 5 second ping each player
            }
            else
                throw Error("Player already have room");
        }
        catch (e: any)
        {
            console.error("/troom:", e);
            throw Error("Player already have room");
        }
        
    }

    getRoomByPlayerID(id: number): LocalTRoom | null {
        if (this.rooms.has(id))
            return this.rooms.get(id) as LocalTRoom;
        return null;
    }

    removeRoom(playerId: number): void {
        if (this.rooms.has(playerId))
            this.rooms.delete(playerId);
        console.log("TournamentRoomManager: delete room: " + playerId + ", size: ", this.rooms.size);
    }

}

export default fp(async (fastify) => {
  const localTournamentRooms = new LocalTRoomManager();
  fastify.decorate("localTournamentRooms", localTournamentRooms);
});

declare module "fastify" {
  interface FastifyInstance {
    localTournamentRooms: LocalTRoomManager;
  }
}