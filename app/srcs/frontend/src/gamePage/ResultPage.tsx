import { useLocation, useNavigate } from "react-router-dom";
import type { GameScore } from "../../../backend/share/type/gameState";
import type { MatchPlayersData } from "../../../backend/share/type/Matches";
import { Player } from "./player";
import React from "react";
import { Matching } from "./matching";
import type { Leaderboard } from "../../../backend/share/type/tournamentRoomData";
import type { PlayerWithProfileData } from "../../../backend/share/type/Player";
import { apiFetchPrivate } from "../utils";

export function Result({ score, playersData, me, AI }: { score: GameScore, playersData?: MatchPlayersData, me: boolean, AI: boolean}) {
    const [ again, setAgain ] = React.useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        document.title = "Result";
    }, []);

    return (
        <>
            {
                again ? <Matching again={true} AI={AI} /> : (
                <div className="relative flex flex-col items-center justify-center w-full h-screen bg-black-500"  >

                    <div className="flex" >
                        <h1 className={`text-5xl font-bold mb-6`} >Winner!</h1>
                    </div>
                    <div className="flex items-center space-x-4 mb-12">
                        <Player player={score.p1Score > score.p2Score ? playersData?.Players[0] : playersData?.Players[1]} me={me} spin={true}  />
                    </div>

                    <AgainButton callback={() => setAgain(true)} />
                    <HomeButton callback={() => navigate("/", { replace: true })} />

                </div>
                )}
        </>
    );
}

function HomeButton({ callback }: {callback: () => void}) {
    return (
        <div className="absolute bottom-6 right-100 text-black px-6 py-3 rounded">
            <button className="items-center border-black-300 border-2 rounded-lg p-1 mt-2" onClick={callback}>Home</button>
        </div>
    );
}

function AgainButton({ callback }: {callback: () => void}) {
    return (
        <div className="absolute bottom-6 left-100 text-black px-6 py-3 rounded">
            <button className="items-center border-black-300 border-2 rounded-lg p-1 mt-2" onClick={callback}>New Game</button>
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
    const { leaderboard, playerID } = (location.state || {}) as { leaderboard: Leaderboard, playerID: number };

    React.useEffect(() => {
        document.title = "Result";
        console.log("TournamentResult: useEffect");
        if (!leaderboard || !playerID)
            navigate(import.meta.env.VITE_PATH_404NOTFOUND);
        console.log("TOurnamentResult: ", leaderboard);

    }, []);

    return (
        <div className="flex">
            <Rank rank="First" player={leaderboard.first} me={leaderboard.first.id === playerID} />
            <Rank rank="Second" player={leaderboard.second} me={leaderboard.second.id === playerID} />
            <Rank rank="Third" player={leaderboard.third} me={leaderboard.third.id === playerID} />
            <Rank rank="Last" player={leaderboard.last} me={leaderboard.last.id === playerID} />
            <HomeButton callback={() => navigate("/", { replace: true })} />
        </div>
    );
}