import { createTRoomID, initLeaderboard, initTData, TDataWithOutWS } from "../../routes/game/gameUtils.ts";
import type { TData } from "./gameData.ts";
import fp from "fastify-plugin";
import type { DBMatchData } from "./db_MatchData.ts";
import { bindMatchTournament, createTournament, getTournamentLeaderboard, joinTournament } from "../../database/tournament.ts";
import { getMatchByUserId } from "../../database/match.ts";
import type { Player, PlayerWithProfileData } from "./Player.ts";
import type { Matches } from "./Matches.ts";
import { addWinLose, setLoginStatus } from "../../database/profile.ts";

export interface Leaderboard {
    first: PlayerWithProfileData;
    second: PlayerWithProfileData;
    third: PlayerWithProfileData;
    last: PlayerWithProfileData;
}

export class TRoom {

    private readonly id: string;
    private dbID!: number;
    private readonly p1ID: number;
    private readonly p2ID: number;
    private readonly p3ID: number;
    private readonly p4ID: number;
    
    private data!: TData;
    private players: Set<Player>;
    
    private status: null | "round1" | "round2" | "end";
    private r1flag: number;
    private r2flag: number;
    private r1winners: Player[];
    private r1losers: Player[];
    
    private leaderboard: Leaderboard;

    private offline: boolean = false;
    // private r1AStatus: boolean;
    // private r1BStatus: boolean;

    // private r2AStatus: boolean;
    // private r2BStatus: boolean;
    constructor (playerID: [number, number, number, number]) {
            playerID.sort();
            this.p1ID = playerID[0];
            this.p2ID = playerID[1];
            this.p3ID = playerID[2];
            this.p4ID = playerID[3];
            this.id = createTRoomID(playerID);
            this.players = new Set();
            this.status = null;
            this.r1flag = 0;
            this.r1winners = [];
            this.r1losers = [];
            this.leaderboard = initLeaderboard();

            this.r2flag = 0;
    }

    async init(): Promise<void> {
        this.data = await initTData([this.p1ID, this.p2ID, this.p3ID, this.p4ID]);
        console.log("init: ", this.data);
        this.dbID = await createTournament(this.p1ID);
        await joinTournament(this.dbID, this.p1ID);
        await joinTournament(this.dbID, this.p2ID);
        await joinTournament(this.dbID, this.p3ID);
        await joinTournament(this.dbID, this.p4ID);

    }

    checkOffline(): boolean {
        if (!this.offline)
            for (const player of this.players)
                if (player.ws.readyState !== WebSocket.OPEN)
                    this.offline = true;
        return this.offline;
    }

    broadCast(_type: string, state?: "r1" | "r2"): void {
        const tmp = TDataWithOutWS(this.data, state);
        console.log("broadCast sent: ", tmp, tmp.leaderboard, {first: tmp.leaderboard?.first, second: tmp.leaderboard?.second});
        // console.log("broadCast sent: ", {r1p1: tmp.round1.matches[0], r1p2: tmp.round1.matches[1]} 
        //     , {r2p1: tmp.round2.matches[0], r2p2: tmp.round2.matches[1]});
        for (const player of this.players)
        {
            if (player.ws.readyState === WebSocket.OPEN)
                player.ws.send(JSON.stringify({type: _type, state: TDataWithOutWS(this.data, state)}));
            else
            {
                console.log("TRoom: broadCast: offline: ", player.id);
                this.offline = true;
            }
                //TODO: if offline
                // this.gameState.playerOffline = true;
        }
    }

    addPlayer(player: Player): void {
            this.players.add(player);
    }

    startRound1(): void {
        const round1: Matches = this.data.round1;
        this.status = "round1";
        this.broadCast("startRound1");
        
    }

    startRound2(): void {
        const round2: Matches = this.data.round2;
        this.status = "round2";
        this.broadCast("startRound2");
    }

    makeRound1(): void {
        console.log("TGameplay: makeRound1");
        const matches: [Player, Player][] = this.makeMatches();
        const A: Player = matches[0][0];
        const B: Player = matches[0][1];
        const C: Player = matches[1][0];
        const D: Player = matches[1][1];

        this.data.round1.matches = [[A, B], [C, D]];
    }

    makeRound2(): void {
        this.data.round2.matches = [this.r1winners, this.r1losers];
    }

    private makeMatches(): [Player, Player][] {

        const arr = Array.from(this.players);

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

    updateWinnerNLoser(id: number, p1Score: number, p2Score: number): void {
        if (this.status === "round1" && this.r1flag < 2)
        {
            this.r1flag++;
            const r1: Matches = this.data.round1;
            this.bindMatch(id);
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
            this.bindMatch(id);
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
                console.log("updateWNL: ", this.data.leaderboard, {first: this.leaderboard.first, second: this.leaderboard.second});
                addWinLose(this.leaderboard.first.id, "tournament_wins");
                this.status = "end";
            }
        }
        console.log("updateWNL: ", this.r1flag, this.r2flag, this.status);
    }

    setLeaderboard(a: keyof Leaderboard, b: keyof Leaderboard, winner: Player, loser: Player) {
        this.leaderboard[a] = this.data.players[winner.id.toString()];
        this.leaderboard[b] = this.data.players[loser.id.toString()];
    }

    bindMatch(id: number)
    {
        ( async () => {
            const MatchData_A: DBMatchData[] = await getMatchByUserId(id);
            // await console.log(MatchData_A);
            await bindMatchTournament(this.dbID, MatchData_A[0].id);
            console.log("tournament room: bind Match");
        })()
    }

    getPlayerID(): [number, number, number, number] {
        return [this.p1ID, this.p2ID, this.p3ID, this.p4ID];
    }

    getDBID() : number {
        return this.dbID;
    }

    getStatus(): string | null {
        return this.status;
    }

    getData(): TData {
        return this.data;
    }

    addResult(losers: Player[], winners: Player[], loser: Player, winner: Player): void {
        losers.push(loser);
        winners.push(winner);
    }

    getR1Winners(): Player[] {
        return this.r1winners;
    }

    getR1Losers(): Player[] {
        return this.r1losers;
    }

    size(): number {
        return this.players.size;
    }

    getr1Flag(): number {
        return this.r1flag;
    }
}

export class TRoomManager {
    private rooms: Map<string, TRoom>;

    constructor() {
        this.rooms = new Map();
    }

    async createTRoom(playerID: [number, number, number, number]): Promise<void> {
        const roomID: string = createTRoomID(playerID);
        if (!this.rooms.has(roomID))
        {
            this.rooms.set(roomID, new TRoom(playerID));
            const room: TRoom = this.rooms.get(roomID) as TRoom;
            room.init();

            const times = setInterval(() => {
                if (room.getStatus() === "end")
                    clearInterval(times);
                if (room.checkOffline())
                {
                    console.log("/tournament game manager: player offline");
                    room.broadCast("offline");
                    this.removeRoom(roomID);
                    clearInterval(times);
                }
            }, 1000 * 5); //every 5 second ping each player
        }
    }

    getRoom(roomID: string): TRoom | null {
        if (this.rooms.has(roomID))
            return this.rooms.get(roomID)!;
        return null;
    }

    getRoomByPlayerID(id: number): TRoom | null {
        for (const room of this.rooms.values()) {
            if (room.getPlayerID().includes(id))
                return room;
        }
        return null;
    }

    removeRoom(roomID: string): void {
        if (this.rooms.has(roomID))
            this.rooms.delete(roomID);
        console.log("TournamentRoomManager: delete room: " + roomID + ", size: ", this.rooms.size);
    }

}

export default fp(async (fastify) => {
  const TournamentRooms = new TRoomManager();
  fastify.decorate("tournamentRooms", TournamentRooms);
});

declare module "fastify" {
  interface FastifyInstance {
    TournamentRooms: TRoomManager;
  }
}