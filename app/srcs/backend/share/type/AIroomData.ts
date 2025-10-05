import fp from "fastify-plugin";
import { initGameState } from "../../routes/game/gameUtils";
import type { GameState } from "./gameState.ts";
import type { Player } from "./Player.ts";

export class AIRoom {
    private id: number;
    private confirm: boolean;
    private gameState: GameState;
    private player!: Player;

    constructor(_id: number) {
        console.log("AIroom: create room", _id);
        this.id = _id;
        this.confirm = false;
        this.gameState = initGameState();
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
        if (this.player.ws.readyState === WebSocket.OPEN)
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
}

export class AIRoomManager {
    private rooms: Map<number, AIRoom>;

    constructor() {
        this.rooms = new Map<number, AIRoom>();
    }

    getRoom(_id: number): AIRoom | undefined {
            return this.rooms.get(_id);
    }

    createRoom(id: number) {
        if (this.rooms.has(id))
            this.rooms.set(id, new AIRoom(id));
        const room: AIRoom | undefined = this.rooms.get(id);
        {
            setTimeout(() => {
                if (room && !room.getConfirm())
                    room.broadCast("timeout");
            this.deleteRoom(id);
            }, 1000 * 13);
        }
    }

    deleteRoom(id: number): void {
        console.log("/AIRoomManager: remove room: ", id);
        this.rooms.delete(id);
    }
}

export default fp(async (fastify) => {
  const AIrooms = new AIRoomManager();
  fastify.decorate("AIrooms", AIrooms);
});

declare module "fastify" {
  interface FastifyInstance {
    AIrooms: AIRoomManager;
  }
}