import type { GameData } from "../../../backend/share/type/gameData";
import type { Ball, GameState, Paddle } from "../../../backend/share/type/gameState";

export function sendKeyPress(key: string, ws: WebSocket, gameData: GameData) {
    if (ws.readyState === WebSocket.OPEN)
    {
        gameData.keyPress = key;
        ws.send(JSON.stringify(gameData));
        console.log("gamePage: sent" + key);
    }
}

export function draw(gameState: GameState, theme: "black" | "light" | "default"): void {
    if (!gameState) {
        console.log("gamePage: returned");
        return ;
    }
    // console.log("gamePage: draw");

    const canvas = document.getElementById("gameBoard") as HTMLCanvasElement;
    canvas.width = gameState.boardWidth;
    canvas.height = gameState.boardHeight;

    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear canvas

    let color = "black";
    let bgColor = "#ff7272ff";
    if (theme === "light")
    {
        bgColor = "#f9e16cff";
        color = "#8d7100ff";
    }
    else if (theme === "black")
    {
        bgColor = "black";
        color = "grey";
    }

    drawBackground(canvas.width, canvas.height, ctx, bgColor);

    drawBall(gameState.ball, ctx, color);

    drawPaddles(gameState.leftPaddle, ctx, color);
    drawPaddles(gameState.rightPaddle, ctx, color);
}

function drawBackground(width: number, height: number, ctx: CanvasRenderingContext2D, color: string)
{
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
}

function drawBall(ball: Ball, ctx: CanvasRenderingContext2D, color: string): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fill();
}

function drawPaddles(paddle: Paddle, ctx: CanvasRenderingContext2D, color: string): void {
    ctx.fillStyle = color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}