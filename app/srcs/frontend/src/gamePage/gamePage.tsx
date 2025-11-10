import React from "react";
import type { GameData } from "../../../backend/share/type/gameData.ts";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetchPrivate, initGameState, isMobile } from "../utils.ts";
import type { GameScore, GameState} from "../../../backend/share/type/gameState.ts";
import type { MatchPlayersData } from "../../../backend/share/type/Matches.ts";
import { withTranslation, type TranslationProps } from "../_hooks/language.tsx";
import { draw, sendKeyPress } from "./gameUtils.ts";
import { GameLayout } from "./gameLayout.tsx";

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
                const target = e.target as HTMLElement;
                
                if (target.closest(".ui"))
                    return ;

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

    return (
        <GameLayout
            gameData={gameData}
            score={score}
            playersData={playersData}
            Load={Load}
            result={result}
            playerID={playerID}
            confirm={confirm}
            start={start}
            ready={ready}
            isMobile={isMobileRef.current}
            theme={theme}
            setTheme={setTheme}
            t={t}
            AI={false}
        />
    )
}

export const GamePage = withTranslation(GameP);