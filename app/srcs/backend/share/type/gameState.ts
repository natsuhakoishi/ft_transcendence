export interface Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Ball {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
}

export interface GameScore {
    p1Score: number;
    p2Score: number;
}

export interface GameState {
    ball: Ball

    rightPaddle: Paddle;

    leftPaddle: Paddle;

    boardHeight: number;
    boardWidth: number;

    gamingStage: boolean;
    playerOffline: boolean;

    score: GameScore;
}
