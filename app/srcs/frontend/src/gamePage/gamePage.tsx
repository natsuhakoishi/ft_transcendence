import React, { useEffect } from "react";
import type { GameData } from "../../../backend/share/type/gameData.ts";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetchPrivate, initGameState } from "../utils.ts";
import type { Ball, GameScore, GameState, Paddle } from "../../../backend/share/type/gameState.ts";
import type { MatchPlayersData } from "../../../backend/share/type/Matches.ts";
import { LoadingScreen } from "../homePage/home_load.tsx";
import { Score } from "./Score.tsx";
import { Player } from "./player.tsx";
import { Result } from "./ResultPage.tsx";
import { Banner } from "./banner.tsx";

export function GamePage({ onGameOver }: { onGameOver?: () => void}) {
    const navigate = useNavigate();
    console.log("GamePage");
    const location = useLocation();
    const [ Load , setLoad ] = React.useState(true);
    const [ result , setResult ] = React.useState(false);
    const [ playerID, setPlayerID ] = React.useState<number | null>(null);
    const [ gameData, setGameData ] = React.useState<GameData | null>(null);
    // const [ countdown, setCountdown ] = React.useState(true);
    const [ start, setStart ] = React.useState(false);
    // const [ key, setKey ] = React.useState(false);
    const key = React.useRef<boolean>(false);
    const [ ready, setReady ] = React.useState(false);
    const [ confirm, setConfirm ] = React.useState(false);
    const [ ws, setWS ] = React.useState<WebSocket | null>(null);
    const [ score, setScore ] = React.useState<GameScore>({
        p1Score: 0,
        p2Score: 0
    });
    const { RoomID, isTournament, TROOMID, playersData} = (location.state || {}) as {
        RoomID?: string;
        isTournament?: boolean;
        TROOMID?: string;
        playersData?: MatchPlayersData;
    };

    setTimeout(() => {
        setLoad(false);
    }, 1000 * 0.8);

    useEffect(() => {
        console.log("player: ", playerID);
        console.log("playersData: ", playersData);
        console.log("me: ", playerID === playersData?.Players[0].id);
        console.log("me: ", playerID === playersData?.Players[1].id);

    }, [playerID]);

    //TODO: use useEffect/Stage to handle player score
    React.useEffect(() => {
        (async () => {
            console.log("gamePage: useEffect");

            if (!RoomID) {
                console.log("gamePage: missing roomID");
                navigate(import.meta.env.VITE_PATH_404NOTFOUND); //TODO: create room not found react function or redirect to main page
            }
            console.log("GamePage: roomid:", RoomID);

            const ws = new WebSocket(import.meta.env.VITE_GAMEPLAY_ROUTE!);

            let gameData: GameData = {
                roomId: RoomID!,
                playerId: 0,
                keyPress: "null",
                tournament: isTournament ? true : false
            }
            //init default position and board size
            ws.onopen = () => {
                const gameState: GameState = initGameState();
                console.log("ws.onopen: pre rendering");
                draw(gameState);
                setGameData(gameData);
                setWS(ws);
            }

            try {
                const data = await apiFetchPrivate("me", { method: "GET" });
                gameData.playerId = data.id;
                setPlayerID(data.id);
                console.log("/GamePage: playersData: ", playersData);
                console.log("/GamePage: gameData: ", gameData);
                console.log("/GamePage: PlayerID: ", data, playerID, playersData?.Players[0].id, playersData?.Players[1].id);
                console.log("/GamePage: PlayerID: ", playerID === playersData?.Players[0].id);
            }
            catch (e) {
                console.log("Matching: fetch error: ", e);
                navigate(import.meta.env.VITE_PATH_404NOTFOUND);
            }
            // console.log(gameState);

            ws.onmessage = (msg) => {
                // console.log("/gamePage: rev msg");
                const parse: {type : string, gameState: GameState} = JSON.parse(msg.data);
    
                const type: string = parse.type;
                // console.log("/gamePage: ", parse.gameState);
                setScore(parse.gameState.score);
                if (type === "render")
                {
                    key.current = true;
                    draw(parse.gameState);
                }
                else if (type === "start")
                {
                    //TODO: render countdown animation
                    console.log("/gamePage: start");
                    setStart(true);
                    setReady(true);

                    setTimeout( () => {
                        setReady(false);
                        console.log("/gamepage: setTimeout ", start, ready);
                    }, 2000);
                }
                else if (type === "goal")
                {
                    console.log("/gamePage: goal");
                    key.current = false;
                    //TODO: render goal animation
                }
                else if (type === "game_over")
                {
                    console.log("/gamePage: game over");
                    ws.close();
                    setTimeout(()=>{
                        if (gameData.tournament) {
                            console.log("/gamePage: gameOver");
                            navigate("/game/tournament", {state: { tournamentRoomID: TROOMID }});
                            onGameOver?.();
                        }
                        else
                            setResult(true);
                    }, 1000*2);
                    //TODO: render ending
                }
                else if (type === "game_over_offline")
                {
                    console.log("/gamePage: game over offline");
                    ws.close();
                    setTimeout(()=>{
                        if (gameData.tournament) {
                            navigate("/game/tournament", {state: { tournamentRoomID: TROOMID }});
                            onGameOver?.();
                        }
                        else
                            setResult(true);
                    }, 1000*2);
                    //TODO: render ending
                }
                else if (type === "trespassing")
                {
                    console.log("/gamePage trespassing 凸^u^凸");
                    //TODO: trespassing page / popup
                    navigate("/");
                    setTimeout(()=>{
                        ws.close();
                    }, 1000);
                }
            };

            let confirmGame: boolean = false;
            document.addEventListener("keydown", (e) => {
                if (confirmGame && key.current && (e.key === "w" || e.key === "W" || e.key === "ArrowUp")) {
                    console.log("gamePage: up");
                    gameData.keyPress = "up";
                    ws.send(JSON.stringify(gameData));
                }
                else if (confirmGame && key.current && (e.key === "s" || e.key === "S" || e.key === "ArrowDown")) {
                    console.log("gamePage: down");
                    gameData.keyPress = "down";
                    ws.send(JSON.stringify(gameData));
                }
                else if (e.key === "Enter" && !confirmGame)
                {
                    console.log("gamePage:" + e.key);
                    console.log("gamePage:", confirmGame);
                    if (gameData.playerId) {
                        gameData.keyPress = "Enter";
                        if (ws.readyState === WebSocket.OPEN)
                        {
                            ws.send(JSON.stringify(gameData));
                            confirmGame = true;
                            setConfirm(true);
                        }
                    }
                }
            });

            return () => { //when user press 'back button'
                console.log("GamePage: closing ws");
                ws.close();
            };
        })();
    }, []);

    return (
        <div>
            {/* Loading Page */}
            <div className={`absolute inset-0 flex items-center justify-center ${Load ? "visible" : "invisible"} `}>
                <LoadingScreen progress={{step: "Loading", completed: null, total: 1}} />
            </div>

            <div className={`absolute inset-0 flex items-center justify-center ${result ? "visible" : "invisible"} `}>
                <Result score={score} playersData={playersData} me={playerID === playersData?.Players[0].id} />
            </div>

            {/* whole Game's stuff */}
            <div className={`container flex flex-col items-center justify-center ${Load || result ? "invisible" : "visible"}`}>

                {/* players data, pong game's board */}
                <div className="flex items-center justify-between w-full px-10">

                    {/* Player 1 */}
                    <Player player={playersData?.Players[0]} me={playerID === playersData?.Players[0].id} />

                    <div className="flex flex-col items-center"> {/* Pong game's board */}
                        <Score score={score}></Score>

                        {/* Countdown */}
                        {/* <div className={`${!Load && !confirm && !start ? "visible" : "invisible"}`}> */}
                        <Banner confirm={confirm} start={start} ready={ready} gameData={gameData} ws={ws} />
                            {/* <Countdown start={10} gameData={gameData} ws={ws} close={() => setCountdown(false)} /> */}
                        {/* </div> */}
                        <canvas
                            id="gameBoard"
                            className={`w-[${import.meta.env.VITE_GAME_BOARD_WIDTH_PX}px]
                            h-[${import.meta.env.VITE_GAME_BOARD_HEIGHT_PX}px]
                            bg-red-300`}
                            width={`${import.meta.env.VITE_GAME_BOARD_WIDTH_PX}`}
                            height={`${import.meta.env.VITE_GAME_BOARD_HEIGHT_PX}`}
                        ></canvas>
                    </div>

                    {/* Player 2 */}
                    <Player player={playersData?.Players[1]} me={playerID === playersData?.Players[1].id} />
                </div>

            </div>
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
    drawBall(gameState.ball, ctx, color);

    drawPaddles(gameState.leftPaddle, ctx, color);
    drawPaddles(gameState.rightPaddle, ctx, color);
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