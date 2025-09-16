import type { GameState } from "./gameState.ts";

export interface Player {
    id: number;
    ws: any;
}

export class Room {

    private readonly id: string;
    private players: Set<Player>;
    private gameState: GameState;

    constructor(_id: string, _gameState: GameState) {
        this.id = _id;
        this.players = new Set();
        this.gameState = _gameState;
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

    p1ID(): number {        
        return parseInt(this.id.split("-")[0], 10);
    }

    p2ID(): number {
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

    createRoom(roomID: string, gameState: GameState): void {
        if (!this.rooms.has(roomID))
            this.rooms.set(roomID, new Room(roomID, gameState));
    }

    getRoom(roomID: string): Room | null {
        if (!this.rooms.has(roomID))
            return null;
        return this.rooms.get(roomID)!;
    }

    removeRoom(roomID: string): void {
        console.log("/gameplay: remove room: ", roomID);
        this.rooms.delete(roomID);
    }

    // removeRoom(ws: any): void {
    //     this.rooms.forEach( room => {
    //         if (room.hasPlayer(ws))
    //         {
    //             const roomID: string = room.getRoomID();
    //             this.rooms.delete(roomID);
    //             console.log("/gameplay(get): removePlayer: removed room")
    //             return ;
    //         }
    //     })
    // }

    // removePlayer(ws: any): void {
    //     this.rooms.forEach(room => {
    //         if (room.hasPlayer(ws))
    //         {
    //             room.getState().playerOffline = true;
    //             room.removePlayer(ws);
    //         }
    //     });
    // }

    listRooms(): void {
        let i: number = 0;
        this.rooms.forEach((element) => {
            console.log("Rooms list: ", i++);
        });
    }
}