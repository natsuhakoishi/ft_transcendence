import React from "react";
import type { GameData } from "../../backend/share/type/gameData.ts";
import { useNavigate, useSearchParams } from "react-router-dom";
import { initGameState } from "./utils.ts";
import type { GameState, Paddle } from "../../backend/share/type/gameState.ts";

export function GamePage() {
    const navigate = useNavigate();
    console.log("GamePage");
    const [ queryParams ] = useSearchParams();
    const RoomID: string | null = queryParams.get("ROOMID");
    const PlayerID: string | null = queryParams.get("PLAYERID");

    //TODO: use useEffect/Stage to handle player score
    React.useEffect(() => {
        console.log("gamePage: useEffect");
        if (!RoomID || !PlayerID)
        {
            console.log("gamePage: missing roomID / playerID");
            navigate(import.meta.env.VITE_PATH_404NOTFOUND); //TODO: create room not found react function or redirect to main page
        }
        const ws = new WebSocket(import.meta.env.VITE_GAMEPLAY_ROUTE!);

        const boardWidth: number = Number(import.meta.env.VITE_GAME_BOARD_WIDTH_PX);
        const boardHeight: number = Number(import.meta.env.VITE_GAME_BOARD_HEIGHT_PX);
        const paddlesHeight: number = Number(import.meta.env.VITE_GAME_PADDLES_HEIGHT_PX);
        const paddlesWidth: number = Number(import.meta.env.VITE_GAME_PADDLES_WIDTH_PX);

        //init default position and board size
        const gameState: GameState = initGameState(boardWidth, boardHeight, paddlesHeight, paddlesWidth);

        console.log(gameState);

        let gameData: GameData = {
            roomId: RoomID!,
            playerId: parseInt(PlayerID!),
            keyPress: "null",
            gameState: gameState
        }

        if (gameData.keyPress === "null")
            draw(gameState);

        ws.onmessage = (msg) => {
            // console.log("/gamePage: rev msg");
            const parse: {type : string, gameState: GameState} = JSON.parse(msg.data);

            const type: string = parse.type;
            // console.log("/gamePage: ", parse.gameState);
            if (type === "render")
                draw(parse.gameState);
            else if (type === "start")
            {
                //TODO: render countdown animation
                console.log("/gamePage: start");
                setTimeout( () => {}, 2000);
            }
            else if (type === "goal")
            {
                console.log("/gamePage: goal");
                //TODO: render goal animation
            }
            else if (type === "game_over")
            {
                console.log("/gamePage: game over");
                setTimeout(()=>{
                    ws.close();
                }, 1000*10);
                //TODO: render ending
            }
            else if (type === "game_over_offline")
            {
                console.log("/gamePage: game over offline");
                //TODO: render ending
            }
            else if (type === "trespassing")
            {
                console.log("/gamePage trespassing 凸^u^凸");
                //TODO: trespassing page
                setTimeout(()=>{
                    ws.close();
                }, 1000*10);
            }
        };

        let confirmGame: boolean = false;
        document.addEventListener("keydown", (e) => {
            if (confirmGame && (e.key === "w" || e.key === "W" || e.key === "ArrowUp")) {
                console.log("gamePage: up");
                gameData.keyPress = "up";
                ws.send(JSON.stringify(gameData));
            }
            else if (confirmGame && (e.key === "s" || e.key === "S" || e.key === "ArrowDown")) {
                console.log("gamePage: down");
                gameData.keyPress = "down";
                ws.send(JSON.stringify(gameData));
            }
            else if (e.key === "Enter" && !confirmGame)
            {
                confirmGame = true;
                console.log("gamePage:" + e.key);
                gameData.keyPress = "Enter";
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
            <h1 className="text-5xl text-green-500 mb-2">Pong Game</h1>
            <canvas id="gameBoard" className={"w-[" + import.meta.env.VITE_GAME_BOARD_WIDTH_PX + "px] h-[" + import.meta.env.VITE_GAME_BOARD_HEIGHT_PX + "px] bg-red-300"} ></canvas>
        </div>
    )
}

function draw(gameState: GameState): void {
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

    const color = "black";
    drawBall(gameState, ctx, color);

    drawPaddles(gameState.leftPaddle, ctx, color);
    drawPaddles(gameState.rightPaddle, ctx, color);
}

function drawBall(gameState: GameState, ctx: CanvasRenderingContext2D, color: string): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI*2);
    ctx.fill();
}

function drawPaddles(paddle: Paddle, ctx: CanvasRenderingContext2D, color: string): void {
    ctx.fillStyle = color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}