import { createRoomID, initGameState } from "../../routes/game/gameUtils.ts";
import type { GameScore, GameState } from "./gameState.ts";
import fp from "fastify-plugin";
import type { Player } from "./Player.ts";
import { createMatch } from "../../database/match.ts";

export class Room {

    private readonly id: string;
    private p1ID: number;
    private p2ID: number;
    private players: Set<Player>;
    private gameState: GameState;
    private confirm: {p1: boolean, p2: boolean};
    private tournament: boolean;

    constructor(playerID: [number, number]) {
        console.log("class room: constructor called");
        playerID.sort();
        this.p1ID = playerID[0];
        this.p2ID = playerID[1];
        this.id = createRoomID(this.p1ID, this.p2ID);
        this.players = new Set();
        this.gameState = initGameState();
        this.confirm = {p1: false, p2: false};
        this.tournament = false;
        console.log("class room: constructor success");
    }

    addPlayer(player: Player, _tournament: boolean): void {
        // console.log("/gameplay: addPLayer(): ",player);
        this.players.add(player);
        this.tournament = _tournament;
    }

    broadCast(_type: string): void {
        for (const player of this.players)
        {
            if (player.ws.readyState === WebSocket.OPEN)
                player.ws.send(JSON.stringify({type: _type, gameState: this.gameState}));
            else if (!this.gameState.playerOffline)
            {
                this.gameState.playerOffline = true;
                this.mandatoryWin();
                this.broadCast("game_over_offline");
            }
        }
    }

    size(): number {
        return this.players.size;
    }

    getState(): GameState {
        return this.gameState;
    }

    getRoomID(): string {
        return this.id;
    }

    getTournamentFlag(): boolean {
        return this.tournament;
    }

    mandatoryWin(): void {
        for (const player of this.players)
            if (player.ws.readyState === WebSocket.OPEN)
                this.setScore(player.id);
    }

    getP1ID(): number {        
        return this.p1ID;
    }

    getP2ID(): number {
        return this.p2ID;
    }

    addConfirm(id: number): void {
        if (id === this.p1ID)
            this.confirm.p1 = true;
        else if (id === this.p2ID)
            this.confirm.p2 = true;
    }

    getConfirm(): number {
        return (this.confirm.p1 ? 1 : 0) + (this.confirm.p2 ? 1 : 0);
    }

    giveConfirmPlayerWin(): void {
        this.confirm.p1 ? this.setScore(this.p1ID) : this.setScore(this.p2ID);
    }

    private setScore(playerId: number): void {
        if (playerId === this.p1ID) {
            this.gameState.score.p1Score = 3;
            this.gameState.score.p2Score = 0;
        }
        else {
            this.gameState.score.p2Score = 3;
            this.gameState.score.p1Score = 0;
        }
    }
}

export class RoomManager {
    private rooms: Map<string, Room>;

    constructor() {
        this.rooms = new Map();
    }

                                            //tournament offset: number of second
    createRoom(p1ID: number, p2ID: number, tournamentOffset?: number): void {
        console.log("called rooms");

        if (this.getRoomByPlayerID(p1ID) || this.getRoomByPlayerID(p2ID))
            throw Error("Player already have room");
        const roomID: string = createRoomID(p1ID, p2ID);
        if (!this.rooms.has(roomID))
            this.rooms.set(roomID, new Room([p1ID, p2ID]));
        setTimeout(() => {
            const room: Room | undefined = this.rooms.get(roomID);
            if (room && room.getConfirm() < 2)
            {
                if (room.getConfirm() === 1)
                {
                    room.giveConfirmPlayerWin();
                    const score: GameScore = room.getState().score;
                    try {
                        createMatch(room.getP1ID(), room.getP2ID(), score.p1Score, score.p2Score, room.getTournamentFlag());
                        console.log("/gameplay: call database success");
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
                room.broadCast("timeout");
                this.removeRoom(roomID);
            }
        }, (tournamentOffset ? 1000 * tournamentOffset : 1000 * 13));
    }

    getRoom(roomID: string): Room | null {
        if (!this.rooms.has(roomID))
            return null;
        return this.rooms.get(roomID)!;
    }

    getRoomByPlayerID(id: number): Room | null {
        for (const room of this.rooms.values()) {
            if (room.getP1ID() === id || room.getP2ID() === id)
                return room;
        }
        return null;
    }

    removeRoom(roomID: string): void {
        console.log("/roomManager: remove room: ", roomID);
        this.rooms.delete(roomID);
    }

    showRooms(): void {
        console.log("show room: size:", this.rooms.size);
        for (const room of this.rooms.values())
            console.log("show room: ", room.getRoomID());
    }
}

export default fp(async (fastify) => {
  const rooms = new RoomManager();
  fastify.decorate("rooms", rooms);
});

declare module "fastify" {
  interface FastifyInstance {
    rooms: RoomManager;
  }
}