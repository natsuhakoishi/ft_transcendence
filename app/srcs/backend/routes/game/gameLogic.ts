import { AIRoom } from "../../share/type/AIroomData.ts";
import type { GameData } from "../../share/type/gameData.ts";
import type { Ball, GameScore, GameState, Paddle } from "../../share/type/gameState.ts";
import type { Player } from "../../share/type/Player.ts";
import { Room } from "../../share/type/roomData.ts";
import { TRoom } from "../../share/type/tournamentRoomData.ts";
import { AILogic } from "./AIGameLogic.ts";
import { resetBall } from "./gameUtils.ts";

export function start(room: Room | AIRoom, gameOver: () => void, tour: TRoom | null): void {
    room.getState().gamingStage = true;
    console.log("/gameplay: start");

    startRound(room, gameOver, tour);
}

function startRound(room: Room | AIRoom, gameOver: () => void, tour?: TRoom | null): void {
    resetBall(room.getState());

    room.broadCast("start");

    setTimeout(() => {
        runLoop(room, gameOver, tour);
    }, 2000);
}

export function runLoop(room: Room | AIRoom, gameOver: () => void, tour?: TRoom | null): void {
    let runtime: number = 0;
    const intervalId = setInterval( () => {
        runtime += 16;

        const state: GameState = room.getState();
        room.broadCast("render");

        if (room instanceof AIRoom)
            AILogic(room, runtime);

        gameLoop(state);
        if (state.playerOffline || tour?.checkOffline())
        {
            end(room, gameOver);
            clearInterval(intervalId);
            return ;
        }

        if (state.ball.x <= 0)
        {
            state.score.p2Score++;
            clearInterval(intervalId);
            handleGoal(room, gameOver);
        }
        else if (state.ball.x >= state.boardWidth)
        {
            clearInterval(intervalId);
            state.score.p1Score++;
            handleGoal(room, gameOver);
        }

    }, 16); //16ms ~60fps
}

function handleGoal(room: Room | AIRoom, gameOver: () => void, tour?: TRoom | null): void {

    room.broadCast("goal");
    
    if (room.getState().playerOffline)
    {
        end(room, gameOver);
        console.log("goal", room.getState().score);
        return ;
    }

    const score: GameScore = room.getState().score;
    console.log("goal", score);

    if (score.p1Score === 3 || score.p2Score === 3)
    {
        end(room, gameOver);
        return ;
    }

    startRound(room, gameOver, tour);
}

function end(room: Room | AIRoom, gameOver: () => void): void {
    const state: GameState = room.getState();

    state.gamingStage = false;

    // if (state.playerOffline)
    // {
    //     console.log("/gameplay: player offline");
    //     // if (room instanceof Room)
    //     room.mandatoryWin();
    //     room.broadCast("game_over_offline");
    // }
    // else
    // {
    console.log("/gameplay: game over");
    room.broadCast("game_over");
    // }
    gameOver();
}

export function handleKeyPress(room: Room, data: GameData, player: Player): void {

    // const pos: string = data.roomId.indexOf(data.playerId.toString()) === 0 ? "left" : "right";
    if (!data.roomId)
        return ;
    const id: string[] = data.roomId.split("-");
    const pos: string = data.playerId.toString() === id[0] ? "left" : "right";
    const keypress = data.keyPress;

    console.log("/gameplay: handleKeyPress: " + keypress);

    if (!room.getState().gamingStage && room.size() < 2 && room.getConfirm() < 2 && data.keyPress === "init")
        room.addPlayer(player, data.tournament);
    else if (keypress === "Enter") //starting game / confirm key
    {
        room.addConfirm(data.playerId);

        console.log("roomID " + room.getRoomID() + ": player " + player.id.toString() + " ready! " + room.size().toString() + "/2");
        // ws.send(JSON.stringify(room.getState()));
    }
    else if (room.getState().gamingStage)
        keyLogic(room, keypress, pos);
}

export function keyLogic(room: Room | AIRoom, keyPress: string, pos: string) {
        if (pos === "right")
        {
            if (keyPress === "up")
                room.getState().rightPaddle.vy = -10;
            else if (keyPress === "down")
                room.getState().rightPaddle.vy = 10;
            else if (keyPress === "stop")
                room.getState().rightPaddle.vy = 0;
        }
        else if (pos === "left")
        {
            if (keyPress === "up")
                room.getState().leftPaddle.vy = -10;
            else if (keyPress === "down")
                room.getState().leftPaddle.vy = 10;
            else if (keyPress === "stop")
                room.getState().leftPaddle.vy = 0;
        }
}

function handleBoundary(paddle: Paddle, boardHeight: number): void {
    if (paddle.y < 0)
        paddle.y = 0;
    else if (paddle.y + paddle.height > boardHeight)
        paddle.y = boardHeight - paddle.height;
}

function gameLoop(gameState: GameState): void {
    const ball: Ball = gameState.ball;
    const leftPaddle: Paddle = gameState.leftPaddle;
    const rightPaddle: Paddle = gameState.rightPaddle;

    leftPaddle.y += leftPaddle.vy;
    rightPaddle.y += rightPaddle.vy;

    handleBoundary(leftPaddle, gameState.boardHeight);
    handleBoundary(rightPaddle, gameState.boardHeight);

    ball.x += ball.vx;
    ball.y += ball.vy;

    //check ball is touch board's boundary
    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= gameState.boardHeight)
        ball.vy *= -1;

    //check ball is touch paddles
    checkLeftPaddle(leftPaddle, ball);
    checkRightPaddle(rightPaddle, ball);
    limitMaxSpeed(ball, 12);
}

function limitMaxSpeed(ball: Ball, max: number): void {
    if (Math.abs(ball.vx) > max)
        ball.vx = (ball.vx > 0 ? 1 : -1) * max;
    if (Math.abs(ball.vy) > max)
        ball.vy = (ball.vy > 0 ? 1 : -1) * max;
}

function checkLeftPaddle(Paddle: Paddle, ball: Ball): void {
    if (
        ball.x - ball.radius <= Paddle.x + Paddle.width &&
        ball.y >= Paddle.y && 
        ball.y <= Paddle.y + Paddle.height
    )
    {
        ball.vx = Math.abs(ball.vx); //turn right
        ball.vy *= 1.2;
        ball.vx *= 1.2;

        ball.vy += (Math.random() - 0.5) * 4;
    }
}

function checkRightPaddle(Paddle: Paddle, ball: Ball): void {
    if (
        ball.x + ball.radius >= Paddle.x &&
        ball.y >= Paddle.y && 
        ball.y <= Paddle.y + Paddle.height
    )
    {
        ball.vx = -Math.abs(ball.vx); //turn left
        ball.vy *= 1.2;
        ball.vx *= 1.2;

        ball.vy += (Math.random() - 0.5) * 4;
    }
}