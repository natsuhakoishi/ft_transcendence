import type { GameData } from "../../../backend/share/type/gameData";
import type { GameScore } from "../../../backend/share/type/gameState";
import type { MatchPlayersData } from "../../../backend/share/type/Matches";
import { LoadingScreen } from "../homePage/loadData";
import { Banner } from "./banner";
import { Player } from "./player";
import { Result } from "./ResultPage";
import { Score } from "./Score";

export function GameLayout({
    gameData,
    score,
    playersData,
    Load,
    result,
    playerID,
    confirm,
    start,
    ready,
    isMobileRef,
    theme,
    setTheme,
    t
} : {
        gameData: GameData,
        score: GameScore,
        playersData: MatchPlayersData,
        Load: boolean,
        result: boolean,
        playerID: number,
        confirm: boolean,
        start: boolean,
        ready: boolean,
        isMobileRef: React.RefObject<"default" | "black" | "light">,
        theme: "default" | "black" | "light",
        setTheme: React.Dispatch<React.SetStateAction<"default" | "black" | "light">>
        t: any
    }) {

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
                        <Result winner={score.p1Score > score.p2Score ? playersData?.Players[0] : playersData?.Players[1]}  playerID={playerID} AI={false} />
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