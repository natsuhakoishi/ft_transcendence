import { useLocation, useNavigate } from "react-router-dom";
import { LoadingScreen } from "../homePage/loadData";
import React from "react";
import { Result } from "./ResultPage";
import { Player } from "./player";
import { Score } from "./Score";
import { Banner } from "./banner";
import type { GameScore, GameState } from "../../../backend/share/type/gameState";
import type { MatchPlayersData } from "../../../backend/share/type/Matches";
import { initGameState, isMobile } from "../utils";
import type { GameData } from "../../../backend/share/type/gameData";
import { withTranslation, type TranslationProps } from "../_hooks/language";
import { draw, sendKeyPress } from "./gameUtils";

function AIGameP({ t, toasterPluz }: TranslationProps) {
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
    const [ theme, setTheme ] = React.useState<"black" | "light" | "default">("default");
    const themeRef = React.useRef<"black" | "light" | "default">("default");
    const wsRef = React.useRef<WebSocket | null>(null);
    const isMobileRef = React.useRef(isMobile());

    const [ gameData, setGameData ] = React.useState<GameData | null>(null);

    const [ score, setScore ] = React.useState<GameScore>({
        p1Score: 0,
        p2Score: 0
    });

    const {playersData} = (location.state || {}) as { playersData: MatchPlayersData};

    setTimeout(() => {
        setLoad(false);
    }, 1000 * 3);

    React.useEffect(() => {
        document.title = t("title_AI");
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
            draw(gameState, themeRef.current);
            setGameData(gameData);
            gameData.keyPress = "init";
            setPlayerID(gameData.playerId);
            ws.send(JSON.stringify(gameData));
            wsRef.current = ws;
        }

        ws.onmessage = (msg) => {
            const parse: {type : string, gameState: GameState} = JSON.parse(msg.data);

            const type: string = parse.type;
            console.log("/AI gamePage: type: ", type);
            setScore(parse.gameState.score);

            if (type === "render")
            {
                key.current = true;
                draw(parse.gameState, themeRef.current);
            }
            else if (type === "start")
            {
                console.log("/AI gamePage: start");
                setStart(true);
                setReady(true);

                setTimeout(() => {
                    draw(parse.gameState, themeRef.current);
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
                // toasterPluz("pop.game.ERR_timeOut");
                // toasterPluz("pop.game.ERR_timeOut_redirect");
                toasterPluz("game.ERR_forgetReady");
                navigate("/", { replace: true });
            }
            else if (type === "trespassing")
            {
                cleanTouch();
                console.log("/AI gamePage trespassing 凸^u^凸");
                toasterPluz("game.ERR_trespassing");
                navigate("/", { replace: true });
            }
        }

        let confirmGame: boolean = false;
        const keydown = (e: KeyboardEvent) => {
            if (confirmGame && key.current && (e.key === "w" || e.key === "W" || e.key === "ArrowUp"))
                sendKeyPress("up", ws, gameData)
            else if (confirmGame && key.current && (e.key === "s" || e.key === "S" || e.key === "ArrowDown"))
                sendKeyPress("down", ws, gameData);
            else if (e.key === " " && !confirmGame)
            {
                console.log("/AI gamePage:" + e.key);
                console.log("/AI gamePage:", confirmGame);
                if (gameData.playerId) {
                    sendKeyPress("Enter", ws, gameData);
                    confirmGame = true;
                    setConfirm(true);
                    confirmRef.current = true;
                }
            }
        };

        const keyup = () => {
            console.log("AI gamePage: stop");
            if (gameData.keyPress === "Enter" || gameData.keyPress === "up" || gameData.keyPress === "down")
                sendKeyPress("stop", ws, gameData);
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
            console.log("AI GamePage: closing ws");
            key.current = false;
            confirmRef.current = false;
            ws.close();
            cleanTouch();
        };
    }, []);

    React.useEffect(() => {
        themeRef.current = theme;
        draw(initGameState(), theme);
    }, [theme]);

    return (
        <div>
            { //Loading Page
                Load &&
                    <div className={`absolute inset-0 flex items-center justify-center`}>
                        <LoadingScreen progress={{step: t("loading.step_start"), completed: null, total: 1}} />
                    </div>
            }

            { //Result Page
                result && 
                    <div className={`absolute inset-0 flex items-center justify-center`}>
                        <Result winner={score.p1Score > score.p2Score ? playersData?.Players[0] : playersData?.Players[1]}  playerID={playerID} AI={true} />
                        {/* <Result score={score} playersData={playersData} me={score.p1Score > score.p2Score} AI={true} /> */}
                    </div>
            }

            {/* whole Game's stuff */}
            <div
                className={`
                    container flex flex-col items-center justify-center
                    ${isMobileRef.current ? "gap-4" : "gap-12"}
                    ${isMobileRef.current ? "" : "scale-130"}
                    ${Load || result ? "invisible" : "visible"}
                `}
            >

                {/* players data, pong game's board */}
                <div
                    className={`
                        flex items-center justify-between
                        w-full px-10
                        ${isMobileRef.current ? "gap-2" : "gap-10"}
                    `}
                >
                    {/* Player 1 */}
                    <Player
                        player={playersData?.Players[0]}
                        me={playerID === playersData?.Players[0].id}
                        small={isMobileRef.current ? false : true}
                    />
                    {/* Pong game's board */}
                    <div className="flex flex-col items-center gap-2"> 
                        <Score score={score} />
                        <Banner //countdown
                            confirm={confirm}
                            start={start}
                            ready={ready}
                            gameData={gameData}
                        />
                        <canvas
                            id="gameBoard"
                            className={`
                                w-[${import.meta.env.VITE_GAME_BOARD_WIDTH_PX}px]
                                h-[${import.meta.env.VITE_GAME_BOARD_HEIGHT_PX}px]
                            `}
                            width={`${import.meta.env.VITE_GAME_BOARD_WIDTH_PX}`}
                            height={`${import.meta.env.VITE_GAME_BOARD_HEIGHT_PX}`}
                        ></canvas>
                    </div>

                    {/* Player 2 */}
                    <Player
                        player={playersData?.Players[1]}
                        me={playerID === playersData?.Players[1].id}
                        small={isMobileRef.current ? false : true}
                    />
                </div>

                {/* Theme setting bar */}
                <div
                    className={`
                        relative rounded-xl
                        bg-white text-black py-2
                        ${isMobileRef.current || confirm || Load ? "invisible" : "visible"}
                    `}
                >
                    <button
                        className="p-4 ui"
                        onClick={
                            () => {
                                if (theme === "default")
                                    setTheme("black");
                                else if (theme === "black")
                                    setTheme("light");
                                else if (theme === "light")
                                    setTheme("default");
                            }
                        }
                    > {`${t("shared.game.theme")} [${t(`shared.game.${theme}`)}]`}
                    </button>
                </div>
            </div>
        </div>
    )
}

export const AIGamePage = withTranslation(AIGameP);