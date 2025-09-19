import { createTRoomID } from "../../routes/game/gameUtils.ts";
import type { Player } from "./roomData.ts";
import { Room } from "./roomData.ts";
import fp from "fastify-plugin";

export interface Matches {
    type: null | "started" | "ended";
    matches: [Room | null, Room | null];
}

export class TRoom {

    private readonly id: string;
    private readonly p1ID: number;
    private readonly p2ID: number;
    private readonly p3ID: number;
    private readonly p4ID: number;

    private players: Set<Player>;

    private firstGamePlay: Matches;
    private finalGamePlay: Matches;

    constructor (playerID: [number, number, number, number]) {
        playerID.sort();
        this.p1ID = playerID[0];
        this.p2ID = playerID[1];
        this.p3ID = playerID[2];
        this.p4ID = playerID[3];
        this.id = createTRoomID(playerID);
        this.players = new Set();
        this.firstGamePlay = {type: null, matches: [null, null]};
        this.finalGamePlay = {type: null, matches: [null, null]};
    }

    addPlayer(player: Player): void {
        this.players.add(player);
    }

    startFirstGameplay(): void {
        this.makeFirstGameplay();

    }

    makeFirstGameplay(): void {
        console.log("TGameplay: makeFirstGameplay");
        const matches: [Player, Player][] = this.makeMatches();
        const A: Player = matches[0][0];
        const B: Player = matches[0][1];
        const C: Player = matches[1][0];
        const D: Player = matches[1][1];

        const GroupA: Room = new Room([A.id, B.id]);
        const GroupB: Room = new Room([C.id, D.id]);

        this.firstGamePlay.matches = [GroupA, GroupB];
    }

    // startFinalGamePlay(): void {

    // }

    // makeFinalGamePlay(): void {
    //     let A: Player;
    //     let B: Player;
    //     let C: Player;
    //     let D: Player;
    //     if (this.firstGamePlay.matches[0].getState().score.p1Score === 3)
    //         A = 

    // }

    makeMatches(): [Player, Player][] {

        const arr = Array.from(this.players);

        for (let i = arr.length - 1; i > 0; i--) { // Fisher-Yates shuffle
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }

        return [
            [arr[0], arr[1]],
            [arr[2], arr[3]],
        ];
    }

    getPlayerID(): [number, number, number, number] {
        return [this.p1ID, this.p2ID, this.p3ID, this.p4ID];
    }
}

export class TRoomManager {
    private rooms: Map<string, TRoom>;

    constructor() {
        this.rooms = new Map();
    }

    createTRoom(playerID: [number, number, number, number]): void {
        const roomID: string = createTRoomID(playerID);
        if (!this.rooms.has(roomID))
            this.rooms.set(roomID, new TRoom(playerID));
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