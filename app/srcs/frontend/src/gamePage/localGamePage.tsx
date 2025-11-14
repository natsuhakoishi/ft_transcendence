import { useEffect, useRef, useState } from "react";
import type { GameScore, GameState } from "../../../backend/share/type/gameState";
import { initGameState, isMobile } from "../utils";
import { draw } from "./gameUtils";
import { LoadingScreen } from "../homePage/HomeChildC";
import { withTranslation, type TranslationProps } from "../_hooks/language";
import { Result } from "./ResultPage";
import type { MatchPlayersData } from "../../../backend/share/type/Matches";
import { Player } from "./player";
import { Banner } from "./banner";
import { Score } from "./Score";
import { startRound } from "./gameLogic";

export function LocalGameP({ t, toasterPluz }: TranslationProps)
{
    const [ score, setScore ] = useState<GameScore>({
        p1Score: 0,
        p2Score: 0
    });
    const [ start, setStart ] = useState(false);
    const [ state, setState ] = useState<GameState>(initGameState());
    const stateRef = useRef<GameState>(initGameState());
    const [ Load, setLoad ] = useState<boolean>(true);
    const [ result , setResult ] = useState(false);
    const [ ready, setReady ] = useState(false);
    const isMobileRef = useRef(isMobile());
    const [ confirm, setConfirm ] = useState(false);
    const confirmRef = useRef<boolean>(false);
    const key = useRef<boolean>(false);
    const themeRef = useRef<"black" | "light" | "default">("default");
    const [ theme, setTheme ] = useState<"black" | "light" | "default">("default");
    const [ keypressL, setKeypressL ] = useState<"up" | "down" | "stop">("stop");
    const [ keypressR, setKeypressR ] = useState<"up" | "down" | "stop">("stop");

    const [ playersData, setplayersData ] = useState<MatchPlayersData>({
        roomID: "",
        Players: [
            {
                id: 0,
                name: "Player1",
                avatar: "default.webp"
            },
            {
                id: 0,
                name: "Player2",
                avatar: "default.webp"
            }
        ]
    });

    useEffect(() => {
            if (keypressR === "up")
                stateRef.current.rightPaddle.vy = -10;
            else if (keypressR === "down")
                stateRef.current.rightPaddle.vy = 10;
            else if (keypressR === "stop")
                stateRef.current.rightPaddle.vy = 0;
    }, [keypressR]);

    useEffect(() => {
            if (keypressL === "up")
                stateRef.current.leftPaddle.vy = -10;
            else if (keypressL === "down")
                stateRef.current.leftPaddle.vy = 10;
            else if (keypressL === "stop")
                stateRef.current.leftPaddle.vy = 0;
    }, [keypressL]);

    useEffect(() => {
        setState(stateRef.current);
        setScore(stateRef.current.score);
    }, [stateRef.current]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoad(false);
        }, 1000 * 1.5);

        draw(state, theme);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        themeRef.current = theme;
        draw(initGameState(), theme);
    }, [theme]);

    useEffect(() => {
            let confirmGame: boolean = false;
            const keydown = (e: KeyboardEvent) => {
                if (confirmGame && key.current && (e.key === "w" || e.key === "W"))
                    setKeypressL("up");
                else if (confirmGame && key.current && (e.key === "s" || e.key === "S"))
                    setKeypressL("down");
                else if (confirmGame && key.current && e.key === "ArrowUp")
                    setKeypressR("up");
                else if (confirmGame && key.current && e.key === "ArrowDown")
                    setKeypressR("down");
                else if (e.key === " " && !confirmGame)
                {
                    console.log("LocalGamePage:" + e.key);
                    console.log("LocalGamePage:", confirmGame);
                    setConfirm(true);
                    key.current = true;
                    confirmRef.current = true;
                    confirmGame = true;
                    setReady(true);
                    setStart(true);
                    startRound(
                        stateRef.current,
                        score, themeRef.current,
                        (b: boolean) => setReady(b),
                        () => {
                        cleanTouch();
                        setResult(true);
                    });
                }
            };

            const keyup = (key: KeyboardEvent) => {
                console.log("gamePage: keyup");
                if (key.code === "ArrowUp" || key.code === "ArrowDown")
                    setKeypressR("stop");
                if (key.key === "W" || key.key === "w" ||
                    key.key === "S" || key.key === "s"
                )
                    setKeypressL("stop");
            };

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

        return () => {
                cleanTouch();
        }
    }, []);

    return (
        <div>
            { //Loading Page
                Load &&
                    <div className={`absolute inset-0 flex items-center justify-center`}>
                        <LoadingScreen progress={{step: t("loading.step_start"), completed: null, total: 1}} />
                    </div>
            }

            {/* Result Page */}
            {
                result &&
                    <div className={`absolute inset-0 flex items-center justify-center`}>
                        <Result
                            winner={score.p1Score > score.p2Score ? playersData?.Players[0] : playersData?.Players[1]}
                            playerID={0}
                            AI={false}
                            local={true}
                        />
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
                        me={false}
                        small={isMobileRef.current ? false : true}
                        txtSmall={isMobileRef.current}
                    />
                    {/* Pong game's board */}
                    <div className="flex flex-col items-center gap-2">
                        <Score score={score} />
                        <Banner //countdown
                            confirm={confirm}
                            start={start}
                            ready={ready}
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
                        me={false}
                        small={isMobileRef.current ? false : true}
                        txtSmall={isMobileRef.current}
                    />
                </div>

                {/* Theme setting bar */}
                <div
                    className={`
                        relative z-20 
                        rounded-xl
                        bg-white text-black py-2
                        ${isMobileRef.current || confirm || Load ? "invisible" : "visible"}
                    `}
                >
                    <button
                        className="p-4 ui"
                        onClick={
                            () => {
                                console.log("setTheme");
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
    );
}


export const LocalGamePage = withTranslation(LocalGameP);