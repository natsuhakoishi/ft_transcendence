import type { PlayerWithProfileData } from "../../../backend/share/type/Player";
import { useLocation, useNavigate } from "react-router-dom";
import type { MatchPlayersData } from "../../../backend/share/type/Matches";

export function Loading() {
    const navigate = useNavigate();
    const location = useLocation();
    const { playerID, playersData } = (location.state || {}) as {
        playerID: string,
        playersData: MatchPlayersData
    };

    console.log("loading: ",playersData);
    const player1: PlayerWithProfileData = playersData.Players[0];
    const player2: PlayerWithProfileData = playersData.Players[1];

    console.log("Loading: ", playersData, playerID);

    setTimeout(() => {
        console.log("Loading: to Gameplay");
        navigate(import.meta.env.VITE_PATH_GAMEPLAY, { state: {RoomID: playersData.roomID, isTournament: false, playersData: playersData} });
    }, 1000 * 2);

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
                {/* Player 1 */}
                <div className="flex items-center gap-2">
                <img
                    src={import.meta.env.VITE_AVATAR_ROUTE + player1?.avatar}
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
                </div>

                <span className="font-bold">VS</span>

                {/* Player 2 */}
                <div className="flex items-center gap-2">
                <img
                    src={import.meta.env.VITE_AVATAR_ROUTE + player2?.avatar}
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
                </div>
            </div>
    </div>
  );
}