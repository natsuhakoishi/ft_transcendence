import type { GameScore } from "../../../backend/share/type/gameState";
import type { MatchPlayersData } from "../../../backend/share/type/Matches";
import type { PlayerWithProfileData } from "../../../backend/share/type/Player";
import { LoadingScreen } from "../homePage/HomeComponents";
import { Banner } from "./components/banner";
import { Player } from "./components/player";
import { Result } from "./components/ResultPage";
import { Score } from "./components/Score";

export function GameLayout({
    score,
    playersData,
    Load,
    result,
    playerID,
    confirm,
    start,
    ready,
    isMobile,
    theme,
    setTheme,
    t,
    AI,
    localPlayersProfile
} : {
        score: GameScore,
        playersData?: MatchPlayersData,
        Load: boolean,
        result: boolean,
        playerID: number | null,
        confirm: boolean,
        start: boolean,
        ready: boolean,
        isMobile: boolean,
        theme: "default" | "black" | "light",
        setTheme: React.Dispatch<React.SetStateAction<"default" | "black" | "light">>
        t: any
        AI: boolean
        localPlayersProfile?: PlayerWithProfileData[]
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
                    <div className={`fixed inset-0 flex items-center justify-center`}>
                        <Result
                            winner={score.p1Score > score.p2Score ? playersData?.Players[0] : playersData?.Players[1]}
                            playerID={playerID}
                            AI={AI}
                            localPlayersProfile={localPlayersProfile}
                        />
                    </div>
            }

            {/* whole Game's stuff */}
            <div
                className={`
                    container flex flex-col items-center justify-center
                    ${isMobile ? "gap-4" : "gap-12"}
                    ${isMobile ? "" : "scale-130"}
                    ${Load || result ? "invisible" : "visible"}
                `}
            >
                {/* players data, pong game's board */}
                <div
                    className={`
                        flex items-center justify-between
                        w-full px-10
                        ${isMobile ? "gap-2" : "gap-10"}
                    `}
                >

                    {/* Player 1 */}
                    <Player
                        player={playersData?.Players[0]}
                        me={playerID === playersData?.Players[0].id}
                        small={isMobile ? false : true}
                        txtSmall={isMobile}
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
                        me={playerID === playersData?.Players[1].id}
                        small={isMobile ? false : true}
                        txtSmall={isMobile}
                    />
                </div>

                {/* Theme setting bar */}
                <div
                    className={`
                        relative rounded-xl
                        bg-white text-black py-2
                        ${isMobile || confirm || Load ? "invisible" : "visible"}
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
