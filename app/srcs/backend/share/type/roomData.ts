import { createRoomID, initGameState } from "../../routes/game/gameUtils.ts";
import type { GameState } from "./gameState.ts";
import fp from "fastify-plugin";
import type { Player } from "./Player.ts";

export class Room {

    private readonly id: string;
    private p1ID: number;
    private p2ID: number;
    private players: Set<Player>;
    private gameState: GameState;
    private confirm: {p1: boolean, p2: boolean};

    constructor(playerID: [number, number]) {
        console.log("class room: constructor called");
        playerID.sort();
        this.p1ID = playerID[0];
        this.p2ID = playerID[1];
        this.id = createRoomID(this.p1ID, this.p2ID);
        this.players = new Set();
        this.gameState = initGameState();
        this.confirm = {p1: false, p2: false};
        console.log("class room: constructor success");
    }

    addPlayer(player: Player): void {
        // console.log("/gameplay: addPLayer(): ",player);
        this.players.add(player);
    }

    broadCast(_type: string): void {
        for (const player of this.players)
        {
            if (player.ws.readyState === WebSocket.OPEN)
                player.ws.send(JSON.stringify({type: _type, gameState: this.gameState}));
            else
                this.gameState.playerOffline = true;
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
        const roomID: string = createRoomID(p1ID, p2ID);
        if (!this.rooms.has(roomID))
            this.rooms.set(roomID, new Room([p1ID, p2ID]));
        setTimeout(() => {
            const room: Room | undefined = this.rooms.get(roomID);
            if (room && room.getConfirm() < 2)
            {
                if (room.getConfirm() === 1)
                    room.giveConfirmPlayerWin();
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
        console.log("/gameplay: remove room: ", roomID);
        this.rooms.delete(roomID);
    }

    listRooms(): void {
        let i: number = 0;
        this.rooms.forEach((element) => {
            console.log("Rooms list: ", i++);
        });
    }

    showRooms(): void {
        console.log("show room: size:", this.rooms.size);
        for (const room of this.rooms.values()) {
            console.log("show room: ", room.getRoomID());
        }
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