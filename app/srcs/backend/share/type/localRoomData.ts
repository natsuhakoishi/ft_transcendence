import fp from "fastify-plugin";
import { initGameState } from "../../routes/game/gameUtils.ts";
import type { GameState } from "./gameState.ts";
import type { Player } from "./Player.ts";

export class LocalRoom {
    private id: number;
    private confirm: boolean;
    private gameState: GameState;
    private player: Player;

    constructor(_id: number) {
        console.log("LocalRoom: create room", _id);
        this.id = _id;
        this.confirm = false;
        this.gameState = initGameState();
        this.player = {id: 0, ws: null};
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

}

export class LocalRoomManager {
    private rooms: Map<number, LocalRoom>;

    constructor() {
        this.rooms = new Map<number, LocalRoom>();
    }

    getRoom(_id: number): LocalRoom | undefined {
            return this.rooms.get(_id);
    }

    createRoom(id: number) {
        if (!this.rooms.has(id))
            this.rooms.set(id, new LocalRoom(id));
        const room: LocalRoom | undefined = this.rooms.get(id);
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