import { useLocation, useNavigate } from "react-router-dom";
import { Player } from "./player";
import React from "react";
import { Matching } from "./matching";
import type { Leaderboard } from "../../../backend/share/type/tournamentRoomData";
import type { PlayerWithProfileData } from "../../../backend/share/type/Player";
import { useLang } from "../_hooks/language";

export function Result({ winner, playerID, AI }: { winner?: PlayerWithProfileData, playerID: number | null, AI: boolean}) {
    const [ again, setAgain ] = React.useState(false);
    const navigate = useNavigate();
    const { t } = useLang();

    React.useEffect(() => {
        document.title = t("shared.result.title");
    }, []);

    return (
        <>
            {
                again ? <Matching again={true} AI={AI} /> : (
                <div className="relative flex flex-col items-center justify-center w-full h-screen bg-black-500"  >

                    <div className="flex" >
                        <h1 className={`text-5xl font-bold mb-6`} >{t("shared.result.msg_winner")}</h1>
                    </div>
                    <div className="flex items-center space-x-4 mb-12">
                        <Player player={winner} me={playerID === winner?.id} spin={true}  />
                    </div>

                    <AgainButton callback={() => setAgain(true)} t={t} />
                    <HomeButton callback={() => navigate("/", { replace: true })} t={t} />

                </div>
                )}
        </>
    );
}

function HomeButton({ callback, t }: { callback: () => void, t: (key: string) => string }) {
    return (
        <div className="absolute bottom-6 right-100 text-black px-6 py-3 rounded">
            <button className="items-center border-black-300 border-2 rounded-lg p-1 mt-2" onClick={callback}>{t("shared.result.btn_home")}</button>
        </div>
    );
}

function AgainButton({ callback, t }: { callback: () => void, t: (key: string) => string }) {
    return (
        <div className="absolute bottom-6 left-100 text-black px-6 py-3 rounded">
            <button className="items-center border-black-300 border-2 rounded-lg p-1 mt-2" onClick={callback}>{t("shared.result.btn_again")}</button>
        </div>
    );
}

function Rank({rank, player, me}: {rank: string, player: PlayerWithProfileData, me: boolean}) {
    return (
        <div>
            <h1 className="text-4xl text-black-500 font-bold mb-2">{rank}</h1>
            <Player player={player} me={me} />
        </div>
    );
}

export function TournamentResultPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useLang();
    const { leaderboard, playerID } = (location.state || {}) as { leaderboard: Leaderboard, playerID: number };

    React.useEffect(() => {
        document.title = t("shared.result.title");
        console.log("TournamentResult: useEffect");
        if (!leaderboard || !playerID)
            navigate(import.meta.env.VITE_PATH_404NOTFOUND, { replace: true });
        console.log("TOurnamentResult: ", leaderboard);

    }, []);

    return (
        <div className="flex">
            <Rank rank={t("shared.game_stat.rank_1th")} player={leaderboard.first} me={leaderboard.first.id === playerID} />
            <Rank rank={t("shared.game_stat.rank_2nd")} player={leaderboard.second} me={leaderboard.second.id === playerID} />
            <Rank rank={t("shared.game_stat.rank_3rd")} player={leaderboard.third} me={leaderboard.third.id === playerID} />
            <Rank rank={t("shared.game_stat.rank_4th")} player={leaderboard.last} me={leaderboard.last.id === playerID} />
            <HomeButton callback={() => navigate("/", { replace: true })} t={t} />
        </div>
    );
}