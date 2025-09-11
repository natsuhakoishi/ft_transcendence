import React from "react";
import type { GameData, GameState } from "../../backend/share/type/gameData";
import { Navigate, useSearchParams } from "react-router-dom";

export function GamePage() {
    console.log("GamePage");
    const [ queryParams ] = useSearchParams();
    const RoomID: string | null = queryParams.get("ROOMID");
    const PlayerID: string | null = queryParams.get("PLAYERID");
    
    if (!RoomID || !PlayerID)
        Navigate("/roomNotFound"); //TODO: create room not found react function

    let gameData: GameData = {
        roomId: RoomID!,
        playerId: parseInt(PlayerID!),
        keyPress: "null"
    }

    React.useEffect(() => {
        const ws = new WebSocket("ws://localhost:4242/game/games");

        let gameState: GameState = {
            ball: { x: 300, y: 200, vx: 2, vy: 2 },
            paddles: { left: 150, right: 150 }
        };

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
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear canvas

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, 10, 0, Math.PI*2);
    ctx.fill();

    ctx.fillRect(20, gameState.paddles.left, 10, 80);
    ctx.fillRect(570, gameState.paddles.right, 10, 80);
}
