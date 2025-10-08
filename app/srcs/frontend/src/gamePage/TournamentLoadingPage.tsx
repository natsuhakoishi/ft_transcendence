import type { Matches } from "../../../backend/share/type/Matches";
import type { PlayerWithProfileData } from "../../../backend/share/type/Player";
import { LoadingScreen } from "../homePage/loadData";
import { Player } from "./player";

export interface LoadingProps {
    leaderboard?: {
        matches: Matches;
        players: Record<string, PlayerWithProfileData>;
    };
    load: boolean;
    playerID?: string;
}

export function TournamentLoading({ leaderboard, load, playerID }: LoadingProps) {
    if (load || !leaderboard)
        return (<LoadingScreen progress={{step: "Loading", completed: null, total: 1}} />);

    const { matches, players } = leaderboard;

    console.log("Loading: " + playerID, leaderboard, playerID);

    return (
        <div className="flex flex-col gap-8">
        {matches.matches.map((match, idx) => {
            const [p1, p2] = match;
            const player1: PlayerWithProfileData = players[p1.id.toString()];
            const player2: PlayerWithProfileData = players[p2.id.toString()];

            return (
            <div key={idx} className="flex items-center gap-4">
                {/* Player 1 */}
                <div className="flex gap-8 items-center">
                    <Player player={player1} me={player1?.id.toString() === playerID} />
                    <h1 className="font-bold text-5xl">VS</h1>
                    <Player player={player2} me={player2?.id.toString() === playerID} />
                </div>
                {/* <div className="flex items-center gap-2">
                <img
                    src={import.meta.env.VITE_API_AVATAR + player1?.avatar}
                    alt={player1?.name}
                    className="w-8 h-8 rounded-full border"
                />
                <span
                    className={`font-medium ${
                    player1?.id.toString() === playerID ? "text-blue-600" : ""
                    }`}
                >
                    {player1?.name}
                </span>
                </div> */}

                {/* <span className="font-bold">VS</span> */}

                {/* Player 2 */}
                {/* <div className="flex items-center gap-2">
                <img
                    src={import.meta.env.VITE_API_AVATAR + player2?.avatar}
                    alt={player2?.name}
                    className="w-8 h-8 rounded-full border"
                />
                <span
                    className={`font-medium ${
                    player2?.id.toString() === playerID ? "text-blue-600" : ""
                    }`}
                >
                    {player2?.name}
                </span>
                </div> */}
            </div>
            );
        })}
    </div>
  );
}