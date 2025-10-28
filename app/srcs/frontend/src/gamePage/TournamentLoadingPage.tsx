import type { Matches } from "../../../backend/share/type/Matches";
import type { PlayerWithProfileData } from "../../../backend/share/type/Player";
import { useLang } from "../_hooks/language";
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
    const { t } = useLang();
    if (load || !leaderboard)
        return (<LoadingScreen progress={{step: t("loading.step_start"), completed: null, total: 1}} />);

    const { matches, players } = leaderboard;

    console.log("Loading: " + playerID, leaderboard, playerID);

    return (
        <div className="grid place-items-center w-screen h-dvh">
            <div
                className="
                    flex flex-col
                    gap-4
                    lg:gap-8
                    scale-50 lg:scale-100
                    w-[90vw] lg:w-[100vw]
                    max-h-[90dvh]
                    origin-center
                    items-center
                "
            >
                {
                    matches.matches.map((match, idx) => {
                        const [p1, p2] = match;
                        const player1: PlayerWithProfileData = players[p1.id.toString()];
                        const player2: PlayerWithProfileData = players[p2.id.toString()];

                        return (
                            <div key={idx}
                                className="
                                    flex flex-row
                                    gap-2 lg:gap-4
                                    items-center justify-center
                                ">
                                    <Player
                                        player={player1}
                                        me={player1?.id.toString() === playerID} />
                                    <h1 className="font-bold text-xl lg:text-5xl ">VS</h1>
                                    <Player
                                        player={player2}
                                        me={player2?.id.toString() === playerID} />
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
}