import type { Ball, GameScore, GameState, Paddle } from "../../../backend/share/type/gameState";
import { draw } from "./gameUtils";

export function startRound(
    state: GameState, 
    score: GameScore, 
    theme: "black" | "light" | "default", 
    setReady: (b: boolean) => void,
    gameOver: () => void
): void {
    resetBall(state);
    setReady(true);
    
    setTimeout(() => {
        draw(state, theme);
    }, 1000);
    
    setTimeout(() => {
        setReady(false);
        runLoop(state, score, theme, setReady, gameOver);
    }, 2000);
}

export function runLoop(
    state: GameState, 
    score: GameScore, 
    theme: "black" | "light" | "default", 
    setReady: (b: boolean) => void,
    gameOver: () => void
): void {
    let runtime: number = 0;
    const intervalId = setInterval( () => {
        runtime += 16;

        draw(state, theme);
        gameLoop(state);

        if (state.ball.x <= 0)
        {
            state.score.p2Score++;
            clearInterval(intervalId);
            handleGoal(state, score, theme, setReady, gameOver);
        }
        else if (state.ball.x >= state.boardWidth)
        {
            clearInterval(intervalId);
            state.score.p1Score++;
            handleGoal(state, score, theme, setReady, gameOver);
        }

    }, 16); //16ms ~60fps
}

export function handleGoal(
    state: GameState, 
    score: GameScore, 
    theme: "black" | "light" | "default", 
    setReady: (b: boolean) => void,
    gameOver: () => void
): void {
    console.log("goal", score);

    if (score.p1Score === 3 || score.p2Score === 3)
    {
        gameOver();
        return ;
    }

    startRound(state, score, theme, setReady, gameOver);
}

function resetBall(state: GameState): void {
	const boardWidth: number = Number(import.meta.env.VITE_GAME_BOARD_WIDTH_PX);
	const boardHeight: number = Number(import.meta.env.VITE_GAME_BOARD_HEIGHT_PX);
	const paddlesHeight: number = Number(import.meta.env.VITE_GAME_PADDLES_HEIGHT_PX);
	const paddlesWidth: number = Number(import.meta.env.VITE_GAME_PADDLES_WIDTH_PX);
	const paddlesMargin: number = Number(import.meta.env.VITE_GAME_PADDLES_MARGIN_PX);
	const ballRadius: number = Number(import.meta.env.VITE_GAME_BALL_RADIUS_PX);
	const ballVX: number = Number(import.meta.env.VITE_GAME_BALL_VX_PX);
	const ballVY: number = Number(import.meta.env.VITE_GAME_BALL_VY_PX);

    state.ball.x = boardWidth / 2;
    state.ball.y = boardHeight / 2;

    state.ball.vy = ballVY;
    state.ball.vx = ballVX;
    if (Math.random() < 0.5)
    {
        state.ball.vy *= -1;
        state.ball.vx *= -1;
    }

    state.ball.radius = ballRadius;
    state.leftPaddle.x = paddlesMargin;
    state.leftPaddle.y = boardHeight / 2 - paddlesHeight / 2;
    state.rightPaddle.x = boardWidth - paddlesWidth - paddlesMargin;
    state.rightPaddle.y = boardHeight / 2 - paddlesHeight / 2;
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


function handleBoundary(paddle: Paddle, boardHeight: number): void {
    if (paddle.y < 0)
        paddle.y = 0;
    else if (paddle.y + paddle.height > boardHeight)
        paddle.y = boardHeight - paddle.height;
}