import type { GameState } from "../../share/type/gameState.ts";

export function Trespassing(ws: any): void {
    console.log("/gameplay(ws): player trespassing");
    ws.send(JSON.stringify({type: "trespassing" , gameState: initGameState()}));
}

export function resetBall(state: GameState): void {
    const boardWidth: number = 900;
    const boardHeight: number = 500;
    const paddlesWidth: number = 10;
    const paddlesHeight: number = 200;

    state.ball.x = boardWidth / 2;
    state.ball.y = boardHeight / 2;
    state.ball.vx = 4;
    state.ball.vy = 4;
    state.ball.radius = 10;
    state.leftPaddle.x = 20;
    state.leftPaddle.y = boardHeight / 2 - paddlesHeight / 2;
    state.rightPaddle.x = boardWidth - paddlesWidth - 10;
    state.rightPaddle.y = boardHeight / 2 - paddlesHeight / 2;

    // state.ball.x = 450;
    // state.ball.y = 250;
    // state.ball.vx = 4;
    // state.ball.vy = 4;
    // state.ball.radius = 10;
    // state.leftPaddle.x = 20;
    // state.leftPaddle.y = 150
    // state.rightPaddle.x = 880;
    // state.rightPaddle.y = 150;
}

export function initGameState(): GameState {
    const boardWidth: number = 900;
    const boardHeight: number = 500;
    const paddlesHeight: number = 200;
    const paddlesWidth: number = 10;

    const data: GameState = {
                 //init default position and board size
                ball: { x: boardWidth / 2, y: boardHeight / 2, vx: 4, vy: 4, radius: 10},
                leftPaddle: { x: 20, y: boardHeight / 2 - paddlesHeight / 2, width: paddlesWidth, height: paddlesHeight},
                rightPaddle: { x: boardWidth - paddlesWidth - 10, y: boardHeight / 2 - paddlesHeight / 2, width: paddlesWidth, height: paddlesHeight},
                boardHeight: boardHeight,
                boardWidth: boardWidth,
                gamingStage: false,
                playerOffline: false,
                score: {
                    p1Score: 0,
                    p2Score: 0
                }
            };
    return data;
}

export function createRoomID(p1: number, p2: number): string {
    return p1 > p2 ? `${p2}-${p1}` : `${p1}-${p2}`;
}