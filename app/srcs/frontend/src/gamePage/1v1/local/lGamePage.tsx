import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { initGameState, isMobile } from "../../../utils.ts";
import type { GameScore, GameState} from "../../../../../backend/share/type/gameState.ts";
import type { MatchPlayersData } from "../../../../../backend/share/type/Matches.ts";
import { withTranslation, type TranslationProps } from "../../../_hooks/language.tsx";
import { draw, sendKeyPressLocal } from "../../gameUtils.ts";
import { GameLayout } from "../../gameLayout.tsx";
import type { LocalGameData } from "../../../../../backend/share/type/gameData.ts";

export function LocalGameP({ onGameOver, t, toasterPluz }: { onGameOver?: () => void } & TranslationProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [ Load , setLoad ] = React.useState(true);
    const [ result , setResult ] = React.useState(false);
    const [ start, setStart ] = React.useState(false);
    const key = React.useRef<boolean>(false);
    const confirmRef = React.useRef<boolean>(false);
    const [ ready, setReady ] = React.useState(false);
    const [ confirm, setConfirm ] = React.useState(false);
    const [ score, setScore ] = React.useState<GameScore>({
        p1Score: 0,
        p2Score: 0
    });
    const {playersData, tournament} = (location.state || {}) as { 
        playersData: MatchPlayersData,
        tournament: boolean
    };

    const [ theme, setTheme ] = React.useState<"black" | "light" | "default">("default");
    const themeRef = React.useRef<"black" | "light" | "default">("default");
    const wsRef = React.useRef<WebSocket | null>(null);
    const isMobileRef = React.useRef(isMobile());

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setLoad(false);
        }, 1000 * 1.5);

        return () => clearTimeout(timer);
    }, []);

    React.useEffect(() => {
        document.title = `${t("home.btn_local")} ${tournament ? t("title_tour") : t("title_match")}`;
        if (!playersData)
        {
            toasterPluz("game.ERR_trespassing");
            console.log("local gamePage missing playersData");
            navigate("/", { replace: true });
            return ;
        }
        (async () => {
            console.log("gamePage: useEffect");

            const gameData: LocalGameData = {
                roomId: playersData.roomID,
                playerId: Number(playersData.roomID),
                keyPress: "null",
                tournament: tournament,
                playerName: ""
            }

            console.log("playersData: ", playersData);
            const ws = new WebSocket(import.meta.env.VITE_GAME_API_LOCAL_GAMEPLAY!);

            ws.onopen = () => {
                const gameState: GameState = initGameState();
                console.log("ws.onopen: pre rendering");
                draw(gameState, themeRef.current);

                gameData.keyPress = "init";
                gameData.playerName = playersData.Players[0].name || "";
                ws.send(JSON.stringify({pos: "", data: gameData}));
                wsRef.current = ws;
            }

            ws.onmessage = (msg) => {
                // console.log("/gamePage: rev msg");
                const parse: {
                    type: string,
                    gameState: GameState
                } = JSON.parse(msg.data);

                const type = parse.type;

                // console.log("Local Game: server sent", parse);
                if (type === "trespassing" || !parse.gameState)
                {
                    cleanTouch();
                    toasterPluz("game.ERR_trespassing");
                    navigate("/", { replace: true });
                    return ;
                }
                const gameState: GameState = parse.gameState;
                setScore(gameState.score);
                if (type === "render")
                {
                    key.current = true;
                    draw(gameState, themeRef.current);
                }
                else if (type === "start")
                {
                    console.log("/gamePage: start");
                    setStart(true);
                    setReady(true);

                    setTimeout(() => {
                        draw(gameState, themeRef.current); //pre render new ball and paddles position
                    }, 1000 * 1);

                    setTimeout( () => {
                        setReady(false);
                        console.log("/gamePage: setTimeout ", start, ready);
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
                        if (tournament)
                        {
                            cleanTouch();
                            ws.close();
                            console.log("/localGamePage: gameOver", gameData.playerId);
                            navigate(import.meta.env.VITE_GAME_PATH_LOCAL_TOURNAMENT, { state: {id: gameData.playerId}, replace: true });
                            onGameOver?.();
                        }
                        else
                            setResult(true);
                    }, 1000*2);
                }
                else if (type === "timeout")
                {
                    cleanTouch();
                    ws.close();
                    console.log("/gamepage: confirm", confirmRef.current);
                    toasterPluz("game.ERR_forgetReady");
                    navigate("/", { replace: true });
                }
            };

            let confirmGame: boolean = false;
            const keydown = (e: KeyboardEvent) => {
                if (confirmGame && key.current && (e.key === "w" || e.key === "W"))
                    sendKeyPressLocal("up", ws, gameData, "left", playersData.Players[0].name!);
                else if (confirmGame && key.current && (e.key === "s" || e.key === "S"))
                    sendKeyPressLocal("down", ws, gameData, "left", playersData.Players[0].name!);
                else if (confirmGame && key.current && e.key === "ArrowUp")
                    sendKeyPressLocal("up", ws, gameData, "right", playersData.Players[1].name!);
                else if (confirmGame && key.current && e.key === "ArrowDown")
                    sendKeyPressLocal("down", ws, gameData, "right", playersData.Players[1].name!);
                else if (e.key === " " && !confirmGame)
                {
                    console.log("gamePage:" + e.key);
                    console.log("gamePage:", confirmGame);
                    if (gameData.playerId && ws.readyState === WebSocket.OPEN) {
                        sendKeyPressLocal("Enter", ws, gameData, "left", playersData.Players[0].name!);
                        confirmGame = true;
                        setConfirm(true);
                        confirmRef.current = true;
                    }
                }
            };

            const keyup = (key: KeyboardEvent) => {
                console.log("gamePage: keyup");
                if (key.code === "ArrowUp" || key.code === "ArrowDown")
                    sendKeyPressLocal("stop", ws, gameData, "right", playersData.Players[1].name!);
                if (key.key === "W" || key.key === "w" ||
                    key.key === "S" || key.key === "s"
                )
                    sendKeyPressLocal("stop", ws, gameData, "left", playersData.Players[0].name!);
            }

            // const handleUp = () => sendKeyPress("stop", ws, gameData);

            // document.addEventListener("mousedown", handleClick);
            // document.addEventListener("mouseup", handleUp);

            // document.addEventListener("touchstart", handleTouch);
            // document.addEventListener("touchend", handleUp);

            document.addEventListener("keyup", keyup);
            document.addEventListener("keydown", keydown);

            function cleanTouch(): void {
                // document.removeEventListener("mousedown", handleClick);
                // document.removeEventListener("mouseup", handleUp);

                // document.removeEventListener("touchstart", handleTouch);
                // document.removeEventListener("touchend", handleUp);

                document.removeEventListener("keydown", keydown);
                document.removeEventListener("keyup", keyup);
            }

            return () => { //when user press 'back button'
                console.log("GamePage: closing ws");
                // key.current = false;
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
            score={score}
            playersData={playersData}
            Load={Load}
            result={result}
            playerID={0}
            confirm={confirm}
            start={start}
            ready={ready}
            isMobile={isMobileRef.current}
            theme={theme}
            setTheme={setTheme}
            t={t}
            AI={false}
            localPlayersProfile={playersData.Players}
        />
    )
}

export const LocalGamePage = withTranslation(LocalGameP);