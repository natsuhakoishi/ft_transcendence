import type { PlayerWithProfileData } from "../../../backend/share/type/Player";
import { useLocation, useNavigate } from "react-router-dom";
import type { MatchPlayersData } from "../../../backend/share/type/Matches";
import { Player } from "./player";

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
        <div className="flex gap-8 items-center">
            <Player player={player1} me={player1?.id.toString() === playerID} />
            <h1 className="font-bold text-5xl">VS</h1>
            <Player player={player2} me={player2?.id.toString() === playerID} />
        </div>
    );
}