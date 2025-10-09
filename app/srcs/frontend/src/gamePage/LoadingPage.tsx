import React from "react";
import type { PlayerWithProfileData } from "../../../backend/share/type/Player";
import { useLocation, useNavigate } from "react-router-dom";
import type { MatchPlayersData } from "../../../backend/share/type/Matches";
import { Player } from "./player";

export function Loading() {
    const navigate = useNavigate();
    const location = useLocation();
    const { playerID, playersData, AI } = (location.state || {}) as {
        playerID: string,
        playersData: MatchPlayersData,
        AI: boolean
    };

    console.log("loading: ", playersData);
    const player1: PlayerWithProfileData = playersData.Players[0];
    const player2: PlayerWithProfileData = playersData.Players[1];

    console.log("Loading: ", playerID);

    React.useEffect(() => {
        document.title = "Loading";
        console.log("Loading: to Gameplay", AI);
        const timer = setTimeout(() => {
            if (AI)
                navigate(import.meta.env.VITE_GAME_PATH_AI_GAMEPLAY, { state: {playersData: playersData}, replace: true });
            else
                navigate(import.meta.env.VITE_GAME_PATH_GAMEPLAY, { state: {RoomID: playersData.roomID, isTournament: false, playersData: playersData}, replace: true });
        }, 1000 * 2);

    return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex gap-8 items-center">
            <Player player={player1} me={AI ? true : player1?.id.toString() === playerID} />
            <h1 className="font-bold text-5xl">VS</h1>
            <Player player={player2} me={player2?.id.toString() === playerID} />
        </div>
    );
}