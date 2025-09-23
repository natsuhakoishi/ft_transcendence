import { createTRoomID, initTData, TDataWithOutWS } from "../../routes/game/gameUtils.ts";
import type { TData } from "./gameData.ts";
import type { Player } from "./roomData.ts";
import fp from "fastify-plugin";
import type { DBMatchData } from "./db_MatchData.ts";
import { bindMatchTournament, createTournament, joinTournament } from "../../database/tournament.ts";
import { getMatchByUserId } from "../../database/match.ts";

export interface Matches {
    roomID: string[];
    type: null | "started" | "ended";
    matches: [
        Player[],
        Player[]
    ];
}

export class TRoom {

    private readonly id: string;
    private dbID!: number;
    private readonly p1ID: number;
    private readonly p2ID: number;
    private readonly p3ID: number;
    private readonly p4ID: number;

    private data: TData;
    private players: Set<Player>;

    private status: null | "round1" | "round2" | "end";
    private r1flag: boolean;
    private r2flag: boolean;
    private r1winners: Player[];
    private r1losers: Player[];
    private r2winners: Player[];
    private r2losers: Player[];


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
        this.data = initTData();
        this.players = new Set();
        this.status = null;
        this.r1flag = false;
        this.r2flag = false;
        this.r1winners = [];
        this.r2winners = [];
        this.r1losers = [];
        this.r2losers = [];
    }

    async init(): Promise<void> {
        this.dbID = await createTournament(this.p1ID);
        await joinTournament(this.dbID, this.p1ID);
        await joinTournament(this.dbID, this.p2ID);
        await joinTournament(this.dbID, this.p3ID);
        await joinTournament(this.dbID, this.p4ID);
    }

    broadCast(_type: string): void {
        for (const player of this.players)
        {
            if (player.ws.readyState === WebSocket.OPEN)
                player.ws.send(JSON.stringify({type: _type, state: TDataWithOutWS(this.data)}));
            else
                console.log("TRoom: broadCast: offline: ", player.id);
                //TODO: if offline
                // this.gameState.playerOffline = true;
        }
    }

    addPlayer(player: Player): void {
        this.players.add(player);
    }

    // updateBoard(playerID: number): void {
    //     ( async () => {
    //         if (!this.r1AStatus)
    //         {
    //             const round1: Matches = this.data.round1;
    //             if (round1.matches[0][0].id === playerID || round1.matches[0][1].id === playerID)
    //             {
    //                 this.r1AStatus = true;
    //                 const MatchData_A: DBMatchData[] = await getMatchByUserId(round1.matches[0][0].id);
                        
    //             }
    //         }

    //     })()
    // }

    startRound1(): void {
        ( async () => {
            const round1: Matches = this.data.round1;
            this.status = "round1";
            round1.type = "started";
            this.broadCast("startRound1");
            // round1.type = "ended";

            // const MatchData_A: DBMatchData[] = await getMatchByUserId(round1.matches[0][0].id);
            // const MatchData_B: DBMatchData[] = await getMatchByUserId(round1.matches[1][0].id);

            // console.log("Tournament Room: bind match id to tournament");
            // await bindMatchTournament(this.dbID, MatchData_A[0].id);
            // await bindMatchTournament(this.dbID, MatchData_B[0].id);

            // this.makeRound2(MatchData_A, MatchData_B);
        })();
    }

    makeRound2(A: DBMatchData[], B: DBMatchData[]): void {
        const r1A: Player[] = this.data.round1.matches[0];
        const r1B: Player[] = this.data.round1.matches[1];

        const winner: Player[] = []; 
        const loser: Player[] = [];

        if (A[0].winner_id === r1A[0].id)
        {
            winner.push(r1A[0]);
            loser.push(r1A[1]);
        }
        else
        {
            winner.push(r1A[1]);
            loser.push(r1A[0]);
        }

        if (B[0].winner_id === r1B[0].id)
        {
            winner.push(r1B[0]);
            loser.push(r1B[1]);
        }
        else
        {
            winner.push(r1B[1]);
            loser.push(r1B[0]);
        }

        this.data.round2.matches = [winner, loser];
        this.status = "round2";
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
        if (this.status === "round1" && !this.r1flag)
        {
            this.r1flag = true;
            const r1: Matches = this.data.round1;
            this.bindMatch(id);
            if (r1.matches[0][0].id === id || r1.matches[0][1].id === id)
                if (p1Score > p2Score)
                    this.addResult(this.r1losers, this.r1winners, r1.matches[0][1], r1.matches[0][0]);
                else
                    this.addResult(this.r1losers, this.r1winners, r1.matches[0][0], r1.matches[0][1]);
            else
            {
                if (p1Score > p2Score)
                    this.addResult(this.r1losers, this.r1winners, r1.matches[1][1], r1.matches[1][0])
                else
                    this.addResult(this.r1losers, this.r1winners, r1.matches[1][0], r1.matches[1][1])
            }
        }
        // else 
        // {

        // }
    }

    bindMatch(id: number)
    {
        ( async () => {
            const MatchData_A: DBMatchData[] = await getMatchByUserId(id);
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

    size(): number {
        return this.players.size;
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