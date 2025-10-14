import { useLocation, useNavigate } from "react-router-dom";
import { LoadingScreen } from "../homePage/loadData";
import React from "react";
import { Result } from "./ResultPage";
import { Player } from "./player";
import { Score } from "./Score";
import { Banner } from "./banner";
import type { GameScore, GameState } from "../../../backend/share/type/gameState";
import type { MatchPlayersData } from "../../../backend/share/type/Matches";
import { initGameState } from "../utils";
import { draw } from "./gamePage";
import type { GameData } from "../../../backend/share/type/gameData";
import toast from "react-hot-toast";

export function AIGamePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const key = React.useRef<boolean>(false);
    const [ confirm, setConfirm ] = React.useState(false);
    const [ Load , setLoad ] = React.useState(true);
    const [ ready, setReady ] = React.useState(false);
    const [ start, setStart ] = React.useState(false);
    const [ playerID, setPlayerID ] = React.useState<number | null>(null);
    const [ result , setResult ] = React.useState(false);
    const confirmRef = React.useRef<boolean>(false);

    const [ gameData, setGameData ] = React.useState<GameData | null>(null);

    const [ score, setScore ] = React.useState<GameScore>({
        p1Score: 0,
        p2Score: 0
    });

    const {playersData} = (location.state || {}) as { playersData: MatchPlayersData};

    setTimeout(() => {
        setLoad(false);
    }, 1000 * 0.8);

    React.useEffect(() => {
        document.title = "AI Game";
        const ws = new WebSocket(import.meta.env.VITE_GAME_API_AI_GAMEPLAY);

        const gameData: GameData = {
            roomId: "",
            playerId: playersData.Players[0].id,
            keyPress: "null",
            tournament: false
        }

        ws.onopen = () => {
            const gameState: GameState = initGameState();
            console.log("ws.onopen: pre rendering");
            draw(gameState);
            setGameData(gameData);
            gameData.keyPress = "init";
            setPlayerID(gameData.playerId);
            ws.send(JSON.stringify(gameData));
        }

        ws.onmessage = (msg) => {
            const parse: {type : string, gameState: GameState} = JSON.parse(msg.data);

            const type: string = parse.type;
            console.log("/AI gamePage: type: ", type);
            setScore(parse.gameState.score);

            if (type === "render")
            {
                key.current = true;
                draw(parse.gameState);
            }
            else if (type === "start")
            {
                console.log("/AI gamePage: start");
                setStart(true);
                setReady(true);

                setTimeout(() => {
                    draw(parse.gameState);
                }, 1000 * 1);

                setTimeout( () => {
                    setReady(false);
                    console.log("/AI gamePage: setTimeout ", start, ready);
                }, 2000);
            }
            else if (type === "goal")
            {
                console.log("/AI gamePage: goal");
                key.current = false;
                //TODO: render goal animation
            }
            else if (type === "game_over")
            {
                confirmRef.current = false;
                console.log("/AI gamePage: game over");
                ws.close();
                setTimeout(()=>{
                    setResult(true);
                }, 1000*2);
            }
            else if (type === "timeout")
            {
                console.log("/AI gamepage timeout")
                toast.error("Timeout");
                toast.error("Back to home");
                navigate("/", { replace: true });
            }
            else if (type === "trespassing")
            {
                console.log("/AI gamePage trespassing 凸^u^凸");
                toast.error("Trespassing!");
                navigate("/", { replace: true });
            }
        }

        let confirmGame: boolean = false;
        const keydown = (e: KeyboardEvent) => {
            if (confirmGame && key.current && (e.key === "w" || e.key === "W" || e.key === "ArrowUp")) {
                console.log("/AI gamePage: up");
                gameData.keyPress = "up";
                ws.send(JSON.stringify(gameData));
            }
            else if (confirmGame && key.current && (e.key === "s" || e.key === "S" || e.key === "ArrowDown")) {
                console.log("/AI gamePage: down");
                gameData.keyPress = "down";
                if (ws.readyState === WebSocket.OPEN)
                    ws.send(JSON.stringify(gameData));
            }
            else if (e.key === " " && !confirmGame)
            {
                console.log("/AI gamePage:" + e.key);
                console.log("/AI gamePage:", confirmGame);
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
            console.log("AI gamePage: stop");
            gameData.keyPress = "stop";
            if (ws.readyState === WebSocket.OPEN)
                ws.send(JSON.stringify(gameData));
        };

        document.addEventListener("keydown", keydown);
        document.addEventListener("keyup", keyup);

        return () => { //when user press 'back button'
            console.log("AI GamePage: closing ws");
            key.current = false;
            confirmRef.current = false;
            ws.close();
            document.removeEventListener("keydown", keydown);
            document.removeEventListener("keyup", keyup);
        };
    }, []);

    return (
        <div>
            {/* Loading Page */}
            <div className={`absolute inset-0 flex items-center justify-center ${Load ? "visible" : "invisible"} `}>
                <LoadingScreen progress={{step: "Loading", completed: null, total: 1}} />
            </div>

            {/* Result Page */}
            <div className={`absolute inset-0 flex items-center justify-center ${result ? "visible" : "invisible"} `}>
                <Result winner={score.p1Score > score.p2Score ? playersData?.Players[0] : playersData?.Players[1]}  playerID={playerID} AI={true} />
                {/* <Result score={score} playersData={playersData} me={score.p1Score > score.p2Score} AI={true} /> */}
            </div>

            {/* whole Game's stuff */}
            <div className={`container gap-12 flex flex-col items-center justify-center ${Load || result ? "invisible" : "visible"}`}>

                {/* players data, pong game's board */}
                <div className="flex items-center justify-between w-full px-10">

                    {/* Player 1 */}
                    <Player player={playersData?.Players[0]} me={playerID === playersData?.Players[0].id} />

                    <div className="flex flex-col items-center"> {/* Pong game's board */}
                        <Score score={score}></Score>

                        {/* Countdown */}
                        <Banner confirm={confirm} start={start} ready={ready} gameData={gameData} />
                        {/* <Banner confirm={confirm.current} start={start} ready={ready} gameData={gameData} /> */}
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