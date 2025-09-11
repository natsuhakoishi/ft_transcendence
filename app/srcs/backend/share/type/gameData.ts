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
        radius: number;
    };

    rightPaddles: {
        x: number;
        y: number;
        width: number;
        height: number;
    };

    leftPaddles: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

class RoomData {
    
}