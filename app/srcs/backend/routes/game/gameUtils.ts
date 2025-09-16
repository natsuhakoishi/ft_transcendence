import type { GameState } from "../../share/type/gameState.ts";

export function Trespassing(gameState: GameState, ws: any): void {
    console.log("/gameplay(ws): player trespassing");
    ws.send(JSON.stringify({type: "trespassing" , gameState}));
}

export function resetBall(state: GameState): void {
    const boardWidth: number = 900;
    const boardHeight: number = 500;
    const paddlesHeight: number = 10;
    const paddlesWidth: number = 200;

    // state.ball.x = boardWidth / 2;
    // state.ball.y = boardHeight / 2;
    // state.ball.vx = 2;
    // state.ball.vy = 2;
    // state.ball.radius = 10;
    // state.leftPaddle.x = 20;
    // state.leftPaddle.y = boardHeight / 2 - paddlesHeight / 2;
    // state.rightPaddle.x = boardWidth - paddlesWidth - 10;
    // state.rightPaddle.y = boardHeight / 2 - paddlesHeight / 2;

    state.ball.x = 450;
    state.ball.y = 250;
    state.ball.vx = 4;
    state.ball.vy = 4;
    state.ball.radius = 10;
    state.leftPaddle.x = 20;
    state.leftPaddle.y = 150
    state.rightPaddle.x = 880;
    state.rightPaddle.y = 150;
}