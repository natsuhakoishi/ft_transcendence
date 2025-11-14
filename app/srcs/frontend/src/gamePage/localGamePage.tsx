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

export function LocalGameP({ t, toasterPluz }: TranslationProps)
{
    const [ score, setScore ] = useState<GameScore>({
        p1Score: 0,
        p2Score: 0
    });
    const [ start, setStart ] = useState(false);
    const [ state, setState ] = useState<GameState>(initGameState());
    const [ Load, setLoad ] = useState<boolean>(true);
    const [ result , setResult ] = useState(false);
    const [ ready, setReady ] = useState(false);
    
    const isMobileRef = useRef(isMobile());
    const [ confirm, setConfirm ] = useState(false);

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
        const timer = setTimeout(() => {
            setLoad(false);
        }, 1000 * 1.5);

        draw(state, );
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {

        return () => {

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
            </div>
        </div>
    );
}

function startRound(): void {
    resetBall(getState());

    room.broadCast("start");

    setTimeout(() => {
        runLoop(room, gameOver, tour);
    }, 2000);
}

export function runLoop(room: Room | AIRoom, gameOver: () => void, tour?: TRoom | null): void {
    let runtime: number = 0;
    const intervalId = setInterval( () => {
        runtime += 16;

        const state: GameState = room.getState();
        room.broadCast("render");

        if (room instanceof AIRoom)
            AILogic(room, runtime);

        gameLoop(state);
        if (state.playerOffline || tour?.checkOffline())
        {
            end(room, gameOver);
            clearInterval(intervalId);
            return ;
        }

        if (state.ball.x <= 0)
        {
            state.score.p2Score++;
            clearInterval(intervalId);
            handleGoal(room, gameOver);
        }
        else if (state.ball.x >= state.boardWidth)
        {
            clearInterval(intervalId);
            state.score.p1Score++;
            handleGoal(room, gameOver);
        }

    }, 16); //16ms ~60fps
}

function handleGoal(gameState: GameState): void {

    room.broadCast("goal");
    
    if (room.getState().playerOffline)
    {
        end(room, gameOver);
        console.log("goal", room.getState().score);
        return ;
    }

    const score: GameScore = room.getState().score;
    console.log("goal", score);

    if (score.p1Score === 3 || score.p2Score === 3)
    {
        end(room, gameOver);
        return ;
    }

    startRound(room, gameOver, tour);
}

export const LocalGamePage = withTranslation(LocalGameP);