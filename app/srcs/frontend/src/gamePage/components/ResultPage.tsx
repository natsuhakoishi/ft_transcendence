import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { Player } from "./player";
import React from "react";
import type { Leaderboard } from "../../../../backend/share/type/tournamentRoomData";
import type { PlayerWithProfileData } from "../../../../backend/share/type/Player";
import { useLang } from "../../_hooks/language";

export function Result({ 
    winner, 
    playerID, 
    AI, 
    localPlayersProfile
}: { 
    winner?: PlayerWithProfileData, 
    playerID: number | null, 
    AI: boolean, 
    localPlayersProfile?: PlayerWithProfileData[]
}) {
    const navigate = useNavigate();
    const { refetchData } = useOutletContext<{ refetchData: () => void}>();
    const { t } = useLang();

    React.useEffect(() => {
        document.title = t("shared.result.title");
        refetchData();
    }, []);

    return (
        <>
            <div className="relative w-full h-full flex flex-col md:justify-center items-center">
                <div className="flex flex-col items-center">
                    <h1 className={`text-4xl md:text-5xl font-bold mt-2 md:mb-6 `} >{t("shared.result.msg_winner")}</h1>
                    <Player
                        player={winner}
                        me={playerID === winner?.id}
                        spin={true} />
                </div>
                <div className="w-1/3 flex justify-between mr-5 md:mt-20">
                    <AgainButton
                        t={t}
                        callback={() => {
                            if (localPlayersProfile)
                                navigate("/", { state: { game: "MatchL", data: localPlayersProfile }, replace: true});
                            else
                            {
                                if (AI)
                                    navigate(import.meta.env.VITE_GAME_PATH_MATCHING, { state: { mode: "AI" }, replace: true})
                                else
                                    navigate(import.meta.env.VITE_GAME_PATH_MATCHING, { state: { mode: "normal" }, replace: true})
                            }
                        }}
                    />
                    <HomeButton callback={() => navigate("/", { replace: true })} t={t} />
                </div>
            </div>
        </>
    );
}

function HomeButton({ callback, t }: { callback: () => void, t: (key: string) => string }) {
    return (
        <div className="text-black rounded">
            <button
                className="items-center border-black-300 border-2 rounded-lg p-1 md:text-2xl hover-increase"
                onClick={callback}
            >{t("shared.result.btn_home")}
            </button>
        </div>
    );
}

function AgainButton({ callback, t }: { callback: () => void, t: (key: string) => string }) {
    return (
        <div className="text-black rounded">
            <button
                className="items-center border-black-300 border-2 rounded-lg p-1 md:text-2xl hover-increase"
                onClick={callback}
                >{t("shared.result.btn_again")}
            </button>
        </div>
    );
}

function Rank({rank, player, me}: {rank: string, player: PlayerWithProfileData, me: boolean}) {
    return (
        <div>
            <h1 className="text-2xl md:text-4xl font-bold text-center mb-2">{rank}</h1>
            <Player player={player} me={me} />
        </div>
    );
}

export function TournamentResultPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useLang();
    const { leaderboard, playerID, localPlayersProfile } = (location.state || {}) as { 
        leaderboard: Leaderboard,
        playerID: number,
        localPlayersProfile: PlayerWithProfileData[]
    };

    React.useEffect(() => {
        document.title = t("shared.result.title");
        console.log("TournamentResult: useEffect");
        if  (!leaderboard)
        {
            navigate("/", { replace: true });
            console.log("result page: trespassing");
            return ;
        }
        console.log("tournamentResult: ", leaderboard);

    }, []);

    return (
        <div className="w-screen h-screen flex flex-col justify-center items-center">
            <div className="
                    relative flex gap-2
                    w-full h-2/3
                    justify-center items-center
                ">
                <Rank
                    rank={t("shared.game_stat.rank_1th")}
                    player={leaderboard.first}
                    me={leaderboard.first.id === playerID} />
                <Rank
                    rank={t("shared.game_stat.rank_2nd")}
                    player={leaderboard.second}
                    me={leaderboard.second.id === playerID} />
                <Rank
                    rank={t("shared.game_stat.rank_3rd")}
                    player={leaderboard.third}
                    me={leaderboard.third.id === playerID} />
                <Rank
                    rank={t("shared.game_stat.rank_4th")}
                    player={leaderboard.last}
                    me={leaderboard.last.id === playerID} />
            </div>
            <div className="w-1/3 flex justify-between mr-5 mt-5 md:mt-20">
                <AgainButton
                    t={t}
                    callback={() => {
                        if (localPlayersProfile)
                            navigate("/", { state: { game: "TourL", data: localPlayersProfile }, replace: true});
                        else
                            navigate(import.meta.env.VITE_GAME_PATH_TOURNAMENT_MATCHING, { replace: true });
                    }}
                />
                <HomeButton callback={() => navigate("/", { replace: true })} t={t} />
            </div>
    </div>
    );
}