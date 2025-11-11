import { GAME_STUPID_AI_CONFIG } from "../../server.ts";
import type { AIRoom } from "../../share/type/AIroomData.ts";
import type { Ball, GameState, Paddle } from "../../share/type/gameState.ts";
import type { Player } from "../../share/type/Player.ts";
import { keyLogic } from "./gameLogic.ts";

export function handleKeyPressAI(keyPress: string, room: AIRoom, player?: Player): void {

    if (player && keyPress === "init")
        room.addPlayer(player);
    else if (keyPress === "Enter")
        room.setConfirm();
    else if (room.getState().gamingStage)
        if (!player)
            keyLogic(room, keyPress, "right");
        else 
            keyLogic(room, keyPress, "left");
}

export function AILogic(room: AIRoom, runtime: number): void {
    const state: GameState = room.getState();
    const ai: Paddle = state.rightPaddle;
    const ball: Ball = state.ball;

    if (runtime % 960 !== 0 && GAME_STUPID_AI_CONFIG === "y")
        return ;

    if (runtime > 960 * 60)
    {
        ball.vx *= 1.5;
        ball.vy *= 1.5;
    }

    if (GAME_STUPID_AI_CONFIG === "y")
    {
        const preDirectionY: number = predictBallY(ball, state.boardHeight, 60);

        const paddleCenter = ai.y + ai.height / 2;
        const diff = preDirectionY - paddleCenter; //between ball and paddle

        if (Math.abs(diff) < ai.height / 2)
            handleKeyPressAI("stop", room);
        else if (diff > 0)
            handleKeyPressAI("down", room);
        else 
            handleKeyPressAI("up", room);
    }
    else
        if (ai.y + ai.height / 2 < ball.y - 10)
            handleKeyPressAI("down", room);
        else if (ai.y + ai.height > ball.y + 10)
            handleKeyPressAI("up", room);
}

function predictBallY(ball: Ball, boardHeight: number, steps: number): number {
    let y: number = ball.y;
    let vy: number = ball.vy;

    for (let i = 0; i < steps; i++) {
        y += vy;
        if (y + ball.radius >= boardHeight || y - ball.radius <= 0)
            vy *= -1;
    }
    return y;
}