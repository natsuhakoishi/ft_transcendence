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

    if (runtime % 960 !== 0)
        return ;

    // const difficulty = () => {
    //     if (runtime < 960 * 10) //  960 == 1second
    //         return "normal";
    //     return "hard";
    // }

    if (runtime > 960 * 60)
    {
        ball.vx *= 1.5;
        ball.vy *= 1.5;
    }

    // const config = {
    //     "normal" : { reactionSpeed: 8, preDirectionError: 100},
    //     "hard" : { reactionSpeed: 10, preDirectionError: 80},
    // }[difficulty()]

    // console.log("difficult: ", difficulty(), runtime);
    // const reactionSpeed: number = config.reactionSpeed;
    // const preDirectionError: number = config.preDirectionError;

    // const targetY = ball.y// + randomError(preDirectionError);

    if (ai.y < ball.y)
    // if (ai.y + ai.height / 2 < targetY - 10)
        handleKeyPressAI("down", room);
        // ai.y += reactionSpeed
    else if (ai.y > ball.y)
    // else if (ai.y + ai.height > targetY + 10)
        handleKeyPressAI("up", room);
        // ai.y += -reactionSpeed
}

// function randomError(range: number): number {
//     return (Math.random() - 0.5) * range;
// }