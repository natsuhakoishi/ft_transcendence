import fp from "fastify-plugin";
import { initGameState } from "../../routes/game/gameUtils.ts";
import type { GameState } from "./gameState.ts";
import type { Player } from "./Player.ts";

export class LocalRoom {
    private id: number;
    private confirm: boolean;
    private gameState: GameState;
    private player: Player;
    private left: string;
    private right: string;

    constructor(_id: number, p1name: string, p2name: string) {
        console.log("LocalRoom: create room", _id);
        this.id = _id;
        this.confirm = false;
        this.gameState = initGameState();
        this.player = {id: 0, ws: null};
        this.left = p1name;
        this.right = p2name;
    }

    getID(): number {
        return this.id;
    }

    getState(): GameState {
        return this.gameState;
    }

    addPlayer(_player: Player): void {
        this.player = _player;
    }

    broadCast(_type: string): void {
        if (this.player.ws && this.player.ws.readyState === WebSocket.OPEN)
            this.player.ws.send(JSON.stringify({type: _type, gameState: this.gameState}));
        else
            this.gameState.playerOffline = true;
    }

    setConfirm(): void {
        this.confirm = true;
    }

    getConfirm(): boolean {
        return this.confirm;
    }

    checkName(name: string): boolean
    {
        return name === this.left || name === this.right
    }

    leftOrRight(name: string): "left" | "right" | "?"
    {
        if (name === this.left)
            return "left";
        else if (name === this.right)
            return "right";
        return "?";
    }
}

export class LocalRoomManager {
    private rooms: Map<number, LocalRoom>;

    constructor() {
        this.rooms = new Map<number, LocalRoom>();
    }

    getRoom(_id: number, name: string): LocalRoom | undefined {
        const room: LocalRoom | undefined = this.rooms.get(_id);
        if (!room || !room.checkName(name))
            return undefined;
        return room;
    }

    createRoom(id: number, p1name: string, p2name: string) {
        if (!this.getRoom(id, p1name) && !this.getRoom(id, p2name))
            this.rooms.set(id, new LocalRoom(id, p1name, p2name));
        else 
            throw Error("Player already have match");
        const room: LocalRoom | undefined = this.getRoom(id, p1name);
        if (room)
            setTimeout(() => {
                if (room && !room.getConfirm())
                {
                    console.log("Local RoomManager: timeout");
                    room.broadCast("timeout");
                    this.deleteRoom(id);
                }
            }, 1000 * 13);
    }

    deleteRoom(id: number): void {
        console.log("/LocalRoomManager: remove room: ", id);
        this.rooms.delete(id);
    }
}

export default fp(async (fastify) => {
  const LocalRooms = new LocalRoomManager();
  fastify.decorate("localRooms", LocalRooms);
});

declare module "fastify" {
  interface FastifyInstance {
    LocalRooms: LocalRoomManager;
  }
}