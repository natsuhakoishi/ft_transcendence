import React from "react";
import type { GameData, GameState } from "../../backend/share/type/gameData.ts";
import { useNavigate, useSearchParams } from "react-router-dom";

export function GamePage() {
    const navigate = useNavigate();
    console.log("GamePage");
    const [ queryParams ] = useSearchParams();
    const RoomID: string | null = queryParams.get("ROOMID");
    const PlayerID: string | null = queryParams.get("PLAYERID");

    React.useEffect(() => {
        if (!RoomID || !PlayerID)
        {
            console.log("gamePage: not found");
            navigate(import.meta.env.VITE_PATH_404NOTFOUND); //TODO: create room not found react function
        }
        const ws = new WebSocket(import.meta.env.VITE_GAMEPLAY_ROUTE!);

        const boardWidth: number = import.meta.env.VITE_GAME_BOARD_WIDTH_PX;
        const boardHeight: number = import.meta.env.VITE_GAME_BOARD_HEIGHT_PX;
        const paddlesHeight: number = import.meta.env.VITE_GAME_PADDLES_HEIGHT_PX;
        const paddlesWidth: number = import.meta.env.VITE_GAME_PADDLES_WIDTH_PX;

        console.log(boardHeight, boardWidth, paddlesHeight, paddlesWidth);
        let gameState: GameState = {
            ball: { x: boardWidth / 2, y: boardHeight / 2, vx: 2, vy: 2, radius: 10},
            leftPaddles: { x: 20, y: boardHeight / 2 - 50, width: paddlesWidth, height: paddlesHeight},
            rightPaddles: { x: boardWidth - 20 - 10, y: boardHeight / 2 - 50, width: paddlesWidth, height: paddlesHeight}
        };

        console.log(gameState);

        let gameData: GameData = {
            roomId: RoomID!,
            playerId: parseInt(PlayerID!),
            keyPress: "null"
        }

        if (gameData.keyPress === "null")
            draw(gameState);

        ws.onmessage = (msg) => {
            gameState = JSON.parse(msg.data);
            draw(gameState);
        };

        document.addEventListener("keydown", (e) => {

            if (e.key === "w" || e.key === "ArrowUp") {
                console.log("gamePage: up");
                gameData.keyPress = "up";
                ws.send(JSON.stringify(gameData));
            }
            else if (e.key === "s" || e.key === "ArrowDown") {
                console.log("gamePage: down");
                gameData.keyPress = "down";
                ws.send(JSON.stringify(gameData));
            }
        });

        return () => { //when user press 'back button'
            console.log("GamePage: closing ws");
            ws.close();
        };
    }, []);

    return (
        <div className="container">
            <h1 className="text-5xl text-green-500">Game</h1>
            <canvas id="gameBoard" className="w-[900px] h-[500px] bg-red-300" ></canvas>
        </div>
    )
}

function draw(gameState: GameState): void {
    if (!gameState) {
        console.log("gamePage: returned");
        return ;
    }
    console.log("gamePage: draw");

    const canvas = document.getElementById("gameBoard") as HTMLCanvasElement;
    canvas.width = import.meta.env.VITE_GAME_BOARD_WIDTH_PX;
    canvas.height = import.meta.env.VITE_GAME_BOARD_HEIGHT_PX;

    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear canvas

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI*2);
    ctx.fill();

    ctx.fillRect(gameState.leftPaddles.x, gameState.leftPaddles.x, gameState.leftPaddles.width, gameState.leftPaddles.height);
    ctx.fillRect(gameState.rightPaddles.x, gameState.rightPaddles.x, gameState.rightPaddles.width, gameState.rightPaddles.height);

}
