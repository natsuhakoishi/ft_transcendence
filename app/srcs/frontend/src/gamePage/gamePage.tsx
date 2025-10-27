import React from "react";
import type { GameData } from "../../../backend/share/type/gameData.ts";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetchPrivate, initGameState, isMobile } from "../utils.ts";
import type { GameScore, GameState} from "../../../backend/share/type/gameState.ts";
import type { MatchPlayersData } from "../../../backend/share/type/Matches.ts";
import { LoadingScreen } from "../homePage/loadData.tsx";
import { Score } from "./Score.tsx";
import { Player } from "./player.tsx";
import { Result } from "./ResultPage.tsx";
import { Banner } from "./banner.tsx";
import { withTranslation, type TranslationProps } from "../_hooks/language.tsx";
import { draw, sendKeyPress } from "./gameUtils.ts";

function GameP({ onGameOver, t, toasterPluz }: { onGameOver?: () => void } & TranslationProps) {
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
    const isMobileRef = React.useRef(isMobile());

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setLoad(false);
        }, 1000 * 3);

        return () => clearTimeout(timer);
    }, []);

    React.useEffect(() => {
        document.title = isTournament ? t("title_tourM") : t("title_match");
        (async () => {
            console.log("gamePage: useEffect");

            if (!RoomID) {
                console.log("gamePage: missing roomID");
                navigate(import.meta.env.VITE_PATH_404NOTFOUND, {replace: true});
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
                navigate(import.meta.env.VITE_PATH_404NOTFOUND, {replace: true});
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
                        toasterPluz("msg_Disconnect");
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
                        // toasterPluz("pop.game.ERR_timeOut");
                        // toasterPluz("pop.game.ERR_timeOut_redicrect");
                        toasterPluz("game.ERR_forgerReady");
                        navigate("/", { replace: true });
                    }
                    //TODO: render ending
                }
                else if (type === "trespassing")
                {
                    cleanTouch();
                    console.log("/gamePage trespassing 凸^u^凸");
                    toasterPluz("game.ERR_trespassing");
                    navigate("/", { replace: true });
                }
            };

            let confirmGame: boolean = false;
            const keydown = (e: KeyboardEvent) => {
                if (confirmGame && key.current && (e.key === "w" || e.key === "W" || e.key === "ArrowUp"))
                    sendKeyPress("up", ws, gameData)
                else if (confirmGame && key.current && (e.key === "s" || e.key === "S" || e.key === "ArrowDown"))
                    sendKeyPress("down", ws, gameData)
                else if (e.key === " " && !confirmGame)
                {
                    console.log("gamePage:" + e.key);
                    console.log("gamePage:", confirmGame);
                    if (gameData.playerId) {
                        sendKeyPress("Enter", ws, gameData);
                        confirmGame = true;
                        setConfirm(true);
                        confirmRef.current = true;
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


            const handleTouch = (e: TouchEvent) => {
                if (!confirmRef.current)
                {
                    sendKeyPress("Enter", ws, gameData);
                    confirmGame = true;
                    setConfirm(true);
                    confirmRef.current = true;
                }
                else if (e.touches[0].clientY < window.innerHeight / 2) 
                    sendKeyPress("up", ws, gameData);
                else
                    sendKeyPress("down", ws, gameData);
            }

            const handleClick = (e: MouseEvent) => {
                if (!confirmRef.current)
                {
                    sendKeyPress("Enter", ws, gameData);
                    confirmGame = true;
                    setConfirm(true);
                    confirmRef.current = true;
                }
                else if (e.clientY < window.innerHeight / 2) 
                    sendKeyPress("up", ws, gameData);
                else
                    sendKeyPress("down", ws, gameData);
            }

            const handleUp = () => sendKeyPress("stop", ws, gameData);

            document.addEventListener("mousedown", handleClick);
            document.addEventListener("mouseup", handleUp);

            document.addEventListener("touchstart", handleTouch);
            document.addEventListener("touchend", handleUp);

            document.addEventListener("keyup", keyup);
            document.addEventListener("keydown", keydown);

            function cleanTouch(): void {
                document.removeEventListener("mousedown", handleClick);
                document.removeEventListener("mouseup", handleUp);

                document.removeEventListener("touchstart", handleTouch);
                document.removeEventListener("touchend", handleUp);

                document.removeEventListener("keydown", keydown);
                document.removeEventListener("keyup", keyup);
            }

            return () => { //when user press 'back button'
                console.log("GamePage: closing ws");
                key.current = false;
                confirmRef.current = false;
                ws.close();

                cleanTouch();
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
                <LoadingScreen progress={{step: t("loading.step_start"), completed: null, total: 1}} />
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

                 {/* bottom control bar */}
                <div className={`flex ${confirm || Load ? "invisible" : "visible"} gap-4`}>

                    {/* Theme setting bar */}
                    <div className={`relative rounded-xl bg-white text-black py-2 ${isMobileRef.current || confirm || Load ? "hidden" : "block"}`}>
                        <button className="p-4"
                                onClick={() => {
                                    if (theme === "default")
                                        setTheme("black");
                                    else if (theme === "black")
                                        setTheme("light");
                                    else if (theme === "light")
                                        setTheme("default");
                                }}>
                        {`${t("shared.game.theme")} [${t(`shared.game.${theme}`)}]`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const GamePage = withTranslation(GameP);