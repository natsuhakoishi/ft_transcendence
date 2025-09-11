export interface GameData {
    roomId: string;

    playerId: number;
    keyPress: string;

}

export interface GameState {
    ball: {
        x: number;
        y: number;
        vx: number;
        vy: number;
    };

    paddles: {
        left: number;
        right: number;
    };
}

class RoomData {
    
}