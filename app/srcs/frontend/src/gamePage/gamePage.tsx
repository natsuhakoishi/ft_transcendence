import React from "react";
import type { GameData } from "../../../backend/share/type/gameData.ts";
import { data, useLocation, useNavigate } from "react-router-dom";
import { apiFetchPrivate, initGameState, isMobile } from "../utils.ts";
import type { Ball, GameScore, GameState, Paddle } from "../../../backend/share/type/gameState.ts";
import type { MatchPlayersData } from "../../../backend/share/type/Matches.ts";
import { LoadingScreen } from "../homePage/loadData.tsx";
import { Score } from "./Score.tsx";
import { Player } from "./player.tsx";
import { Result } from "./ResultPage.tsx";
import { Banner } from "./banner.tsx";
import toast from "react-hot-toast";

export function GamePage({ onGameOver }: { onGameOver?: () => void}) {
    const navigate = useNavigate();
    // console.log("GamePage");
    const location = useLocation();
    const [ Load , setLoad ] = React.useState(true);
    const [ result , setResult ] = React.useState(false);
    const [ start, setStart ] = React.useState(false);
    const [ playerID, setPlayerID ] = React.useState<number | null>(null);
    const [ gameData, setGameData ] = React.useState<GameData | null>(null);
    const key = React.useRef<boolean>(false);
    const confirmRef = React.useRef<boolean>(false);
    const [ ready, setReady ] = React.useState(false);
    const [ confirm, setConfirm ] = React.useState(false);
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
    const [ theme, setTheme ] = React.useState<"black" | "light" | "default">("default");
    const themeRef = React.useRef<"black" | "light" | "default">("default");
    const wsRef = React.useRef<WebSocket | null>(null);
    const isMobileRef = React.useRef(true);
    // const isMobileRef = React.useRef(isMobile());

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setLoad(false);
        }, 1000 * 3);

        return () => clearTimeout(timer);
    }, []);

    React.useEffect(() => {
        document.title = isTournament ? "Tournament: In Game..." : "Game";
        (async () => {
            console.log("gamePage: useEffect");

            if (!RoomID) {
                console.log("gamePage: missing roomID");
                navigate(import.meta.env.VITE_PATH_404NOTFOUND);
            }
            console.log("GamePage: roomid:", RoomID);

            const ws = new WebSocket(import.meta.env.VITE_GAME_API_GAMEPLAY!);

            const gameData: GameData = {
                roomId: RoomID!,
                playerId: 0,
                keyPress: "null",
                tournament: isTournament ? true : false
            }

            try {
                const data = await apiFetchPrivate("me", { method: "GET" });
                gameData.playerId = data.id;
                await setPlayerID(data.id);
                console.log("/GamePage: playersData: ", playersData);
                console.log("/GamePage: gameData: ", gameData);
                console.log("/GamePage: PlayerID: ", data, playerID, playersData?.Players[0].id, playersData?.Players[1].id);
                console.log("/GamePage: PlayerID: ", playerID === playersData?.Players[0].id);
            }
            catch (e) {
                console.log("Matching: fetch error: ", e);
                navigate(import.meta.env.VITE_PATH_404NOTFOUND);
            }

            //init default position and board size
            ws.onopen = () => {
                const gameState: GameState = initGameState();
                console.log("ws.onopen: pre rendering");
                draw(gameState, themeRef.current);
                setGameData(gameData);
                gameData.keyPress = "init";
                ws.send(JSON.stringify(gameData));
                wsRef.current = ws;
            }

            ws.onmessage = (msg) => {
                // console.log("/gamePage: rev msg");
                const parse: {type : string, gameState: GameState} = JSON.parse(msg.data);

                const type: string = parse.type;
                // console.log("/gamePage: type: ", type);
                setScore(parse.gameState.score);
                if (type === "render")
                {
                    key.current = true;
                    draw(parse.gameState, themeRef.current);
                }
                else if (type === "start")
                {
                    //TODO: render countdown animation
                    console.log("/gamePage: start");
                    setStart(true);
                    setReady(true);

                    setTimeout(() => {
                        draw(parse.gameState, themeRef.current); //pre render new ball and paddles position
                    }, 1000 * 1);

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
                    confirmRef.current = false;
                    console.log("/gamePage: game over");
                    ws.close();
                    setTimeout(()=>{
                        if (gameData.tournament) {
                            console.log("/gamePage: gameOver");
                            navigate("/game/tournament", {state: { tournamentRoomID: TROOMID }, replace: true});
                            onGameOver?.();
                        }
                        else
                            setResult(true);
                    }, 1000*2);
                }
                else if (type === "game_over_offline" || type === "timeout")
                {
                    console.log("/gamePage: game over offline");
                    ws.close();
                    console.log("/gamepage: confirm", confirmRef.current);
                    if (confirmRef.current)
                    {
                        confirmRef.current = false;
                        toast.error("Opponent disconnected");
                        setTimeout(()=>{
                            if (gameData.tournament) {
                                navigate("/game/tournament", {state: { tournamentRoomID: TROOMID }, replace: true});
                                onGameOver?.();
                            }
                            else
                                setResult(true);
                        }, 1000*2);
                    }
                    else
                    {
                        toast.error("Timeout");
                        toast.error("Back to home");
                        navigate("/", { replace: true });
                    }
                    //TODO: render ending
                }
                else if (type === "trespassing")
                {
                    console.log("/gamePage trespassing 凸^u^凸");
                    toast.error("Trespassing!");
                    navigate("/", { replace: true });
                }
            };

            let confirmGame: boolean = false;

            const keydown = (e: KeyboardEvent) => {
                if (confirmGame && key.current && (e.key === "w" || e.key === "W" || e.key === "ArrowUp")) {
                    console.log("gamePage: up");
                    gameData.keyPress = "up";
                    ws.send(JSON.stringify(gameData));
                }
                else if (confirmGame && key.current && (e.key === "s" || e.key === "S" || e.key === "ArrowDown")) {
                    console.log("gamePage: down");
                    gameData.keyPress = "down";
                    if (ws.readyState === WebSocket.OPEN)
                        ws.send(JSON.stringify(gameData));
                }
                else if (e.key === " " && !confirmGame)
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
                            confirmRef.current = true;
                        }
                    }
                }
            };

            const keyup = () => {
                console.log("gamePage: keyup");
                if (gameData.keyPress === "Enter" || gameData.keyPress === "up" || gameData.keyPress === "down")
                {
                    gameData.keyPress = "stop";
                    if (ws.readyState === WebSocket.OPEN)
                    {
                        ws.send(JSON.stringify(gameData));
                        console.log("sent stop");
                    }
                }
            };

            document.addEventListener("keydown", keydown);
            document.addEventListener("keyup", keyup);

            return () => { //when user press 'back button'
                console.log("GamePage: closing ws");
                key.current = false;
                confirmRef.current = false;
                ws.close();
                document.removeEventListener("keydown", keydown);
                document.removeEventListener("keyup", keyup);
            };
        })();
    }, []);

    React.useEffect(() => {
        themeRef.current = theme;
        draw(initGameState(), theme);
    }, [theme]);


    function handleKeypress(key: "up" | "down" | "Enter", pressed: boolean)
    {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !gameData)
            return ;
        
        if (pressed)
            gameData.keyPress = key;
        else 
            gameData.keyPress = "stop";
        wsRef.current.send(JSON.stringify(gameData));
    }

    return (
        <div>
            {/* Loading Page */}
            <div className={`absolute inset-0 flex items-center justify-center ${Load ? "visible" : "invisible"} `}>
                <LoadingScreen progress={{step: "Loading", completed: null, total: 1}} />
            </div>

            {/* Result Page */}
            <div className={`absolute inset-0 flex items-center justify-center ${result ? "visible" : "invisible"} `}>
                <Result winner={score.p1Score > score.p2Score ? playersData?.Players[0] : playersData?.Players[1]}  playerID={playerID} AI={false} />
            </div>

            {/* whole Game's stuff */}
            <div className={`container gap-12 flex flex-col items-center justify-center ${Load || result ? "invisible" : "visible"}`}>

                {/* players data, pong game's board */}
                <div className="flex items-center justify-between w-full px-10 gap-10">

                    {/* Player 1 */}
                    <Player player={playersData?.Players[0]} me={playerID === playersData?.Players[0].id} />

                    <div className="flex flex-col items-center gap-2"> {/* Pong game's board */}
                        <Score score={score}></Score>

                        {/* Countdown */}
                        <Banner confirm={confirm} start={start} ready={ready} gameData={gameData} />
                        {/* <Banner confirm={confirm.current} start={start} ready={ready} gameData={gameData} /> */}
                        <canvas
                            id="gameBoard"
                            className={`w-[${import.meta.env.VITE_GAME_BOARD_WIDTH_PX}px]
                                h-[${import.meta.env.VITE_GAME_BOARD_HEIGHT_PX}px]`}
                            width={`${import.meta.env.VITE_GAME_BOARD_WIDTH_PX}`}
                            height={`${import.meta.env.VITE_GAME_BOARD_HEIGHT_PX}
                            `}
                        ></canvas>
                    </div>

                    {/* Player 2 */}
                    <Player player={playersData?.Players[1]} me={playerID === playersData?.Players[1].id} />
                </div>

                <div className={`flex ${confirm || Load ? "invisible" : "visible"} gap-4`}>

                    {/* Theme setting bar */}
                    <div className={`relative rounded-xl bg-white text-black py-2 ${confirm || Load ? "hidden" : "block"}`}>
                        <button className="p-4"
                                onClick={() => {
                                    if (theme === "default")
                                        setTheme("black");
                                    else if (theme === "black")
                                        setTheme("light");
                                    else if (theme === "light")
                                        setTheme("default");
                                }}>
                        {`Theme [${theme}]`}
                        </button>
                    </div>

                    <div className={`flex ${isMobileRef.current && !Load && !result ? "visible" : "invisible" } gap-10 `}>
                        <button className={`p-4 w-30 bg-blue-500 text-white rounded-lg ${confirm && !result && isMobileRef.current ? "visible" : "invisible"}`}
                            onTouchStart={() => handleKeypress("up", true)}
                            onTouchEnd={() => handleKeypress("up", false)}
                            onMouseDown={() => handleKeypress("up", true)}
                            onMouseUp={() => handleKeypress("up", false)}
                            >Up</button>

                        <button className={`${!confirm && !Load && isMobileRef.current ? "visible" : "invisible"} p-4 w-30 bg-red-300 text-white rounded-lg`}
                                onClick={() => {
                                    setConfirm(true);
                                    handleKeypress("Enter", true);
                                }}
                        >Confirm</button>

                        <button className={`p-4 w-30 bg-blue-500 text-white rounded-lg ${confirm && !result && isMobileRef.current ? "visible" : "invisible"}`}
                                onTouchStart={() => handleKeypress("down", true)}
                                onTouchEnd={() => handleKeypress("down", false)}
                                onMouseDown={() => handleKeypress("down", true)}
                                onMouseUp={() => handleKeypress("down", false)}
                            >Down</button>
                    </div>
                </div>
            </div>
        </div>
    )
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
