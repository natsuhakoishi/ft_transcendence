import { createRoomID, initGameState } from "../../routes/game/gameUtils.ts";
import type { GameState } from "./gameState.ts";
import fp from "fastify-plugin";

export default fp(async (fastify) => {
  const rooms = new RoomManager();
  fastify.decorate("rooms", rooms);
});

declare module "fastify" {
  interface FastifyInstance {
    rooms: RoomManager;
  }
}

export interface Player {
    id: number;
    ws: any;
}

export class Room {

    private readonly id: string;
    private p1ID: number;
    private p2ID: number;
    private players: Set<Player>;
    private gameState: GameState;

    constructor(_p1ID: number, _p2ID: number) {
        console.log("class room: constructor called");
        this.p1ID = _p1ID;
        this.p2ID = _p2ID;
        this.id = createRoomID(this.p1ID, this.p2ID);
        this.players = new Set();
        this.gameState = initGameState();
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
        for (const player of this.players) {
            if (player.ws.readyState === WebSocket.OPEN)
                this.setScore(player.id);
        }
        this.broadCast("offline");
    }

    getP1ID(): number {        
        return parseInt(this.id.split("-")[0], 10);
    }

    getP2ID(): number {
        return parseInt(this.id.split("-")[1], 10);
    }

    private setScore(playerId: number): any {
        const pos: string = this.id.indexOf(playerId.toString()) === 0 ? "left" : "right";
        if (pos === "left") {
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

    // createRoom(roomID: string, gameState: GameState): void {
    //     if (!this.rooms.has(roomID))
    //         this.rooms.set(roomID, new Room(roomID, gameState));
    // }

    createRoom(p1ID: number, p2ID: number): void {
        console.log("called rooms");
        const roomID: string = createRoomID(p1ID, p2ID);
        if (!this.rooms.has(roomID))
            this.rooms.set(roomID, new Room(p1ID, p2ID));
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
}