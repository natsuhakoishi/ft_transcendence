import type { GameData } from "../../share/type/gameData.ts";
import type { Ball, GameScore, GameState, Paddle } from "../../share/type/gameState.ts";
import type { Player, Room } from "../../share/type/roomData.ts";
import { resetBall } from "./gameUtils.ts";

export function start(room: Room, gameOver: () => void): void {
    room.getState().gamingStage = true;
    console.log("/gameplay: start");

    startRound(room, gameOver);
}

function startRound(room: Room, gameOver: () => void): void {
    resetBall(room.getState());

    room.broadCast("start");

    //score counting
    setTimeout(() => {
        runLoop(room, gameOver);
    }, 2000);
}

function runLoop(room: Room, gameOver: () => void): void {
    const intervalId = setInterval( () => {

        const state: GameState = room.getState();
        room.broadCast("render");
        gameLoop(state);

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

function handleGoal(room: Room, gameOver: () => void): void {

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

    startRound(room, gameOver);
}

function end(room: Room, gameOver: () => void): void {
    const state: GameState = room.getState();

    state.gamingStage = false;

    if (state.playerOffline)
    {
        console.log("/gameplay: player offline");
        room.mandatoryWin();
        room.broadCast("game_over_offline");
    }
    else
    {
        console.log("/gameplay: game over");
        room.broadCast("game_over");
    }
    gameOver();
}

export function handleKeyPress(room: Room, data: GameData, player: Player): void {

    const pos: string = data.roomId.indexOf(data.playerId.toString()) === 0 ? "left" : "right";
    console.log("/gameplay: handleKeyPress: " + data.keyPress);

    if (!room.getState().gamingStage && room.size() < 2 && data.keyPress === "Enter") //starting game / confirm key
    {
        room.addPlayer(player);
        console.log("roomID " + room.getRoomID() + ": player " + player.id.toString() + " ready! " + room.size().toString() + "/2");
        // ws.send(JSON.stringify(room.getState()));
    }
    else if (room.getState().gamingStage)
    {
        if (pos === "right")
        {
            if (data.keyPress === "up")
                room.getState().rightPaddle.y -= 10;
            else if (data.keyPress === "down")
                room.getState().rightPaddle.y += 10;
        }
        else if (pos === "left")
        {
            if (data.keyPress === "up") {
                room.getState().leftPaddle.y -= 10;
                console.log("/gameplay: left: up");
            }
            else if (data.keyPress === "down")
            {
                room.getState().leftPaddle.y += 10;
                console.log("/gameplay: left: down");
            }
        }
    }
}

function gameLoop(gameState: GameState): void {
    const ball: Ball = gameState.ball;
    const leftPaddle: Paddle = gameState.leftPaddle;
    const rightPaddle: Paddle = gameState.rightPaddle;

    ball.x += ball.vx;
    ball.y += ball.vy;

    //check ball is touch board's boundary
    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= gameState.boardHeight)
        ball.vy *= -1;

    //check ball is touch paddles
    checkLeftPaddle(leftPaddle, ball);
    checkRightPaddle(rightPaddle, ball);
}

function checkLeftPaddle(Paddle: Paddle, ball: Ball): void {
    if (
        ball.x - ball.radius <= Paddle.x + Paddle.width &&
        ball.y >= Paddle.y && 
        ball.y <= Paddle.y + Paddle.height
    )
        ball.vx = Math.abs(ball.vx); //turn right
}

function checkRightPaddle(Paddle: Paddle, ball: Ball): void {
    if (
        ball.x + ball.radius >= Paddle.x &&
        ball.y >= Paddle.y && 
        ball.y <= Paddle.y + Paddle.height
    )
        ball.vx = -Math.abs(ball.vx); //turn left
}