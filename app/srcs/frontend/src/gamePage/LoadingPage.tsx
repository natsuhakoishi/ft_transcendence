import React, { useState } from "react";
import type { PlayerWithProfileData } from "../../../backend/share/type/Player";
import { useLocation, useNavigate } from "react-router-dom";
import type { MatchPlayersData } from "../../../backend/share/type/Matches";
import { Player } from "./components/player";
import { useLang } from "../_hooks/language";

export function Loading({ tournament }: {tournament: boolean}) {
    const { t } = useLang();
    const navigate = useNavigate();
    const location = useLocation();
    const [ player1, setPlayer1 ] = useState<PlayerWithProfileData | undefined>(undefined);
    const [ player2, setPlayer2 ] = useState<PlayerWithProfileData | undefined>(undefined);
    const { playerID, playersData, AI, local } = (location.state || {}) as {
        playerID: string,
        playersData: MatchPlayersData,
        AI: boolean,
        local: boolean
    };

    console.log("loading: ", playersData);
    console.log("Loading: ", playerID);

    React.useEffect(() => {
        if (!playerID || !playersData)
        {
            navigate("/", { replace: true });
            console.log("trespassing");
            return ;
        }
        setPlayer1(playersData.Players[0]);
        setPlayer2(playersData.Players[1]);
        document.title = t("loading.step_start");
        console.log("Loading: to Gameplay", AI);
        const timer = setTimeout(() => {
            if (AI)
                navigate(import.meta.env.VITE_GAME_PATH_AI_GAMEPLAY, {
                    state: {
                        playersData: playersData
                    }, replace: true 
                });
            else if (local && !tournament)
                navigate(import.meta.env.VITE_GAME_PATH_LOCAL_GAMEPLAY, {
                    state: {
                        playersData: playersData,
                        tournament: tournament
                    }, replace: true
                });
            else if (!local)
                navigate(import.meta.env.VITE_GAME_PATH_GAMEPLAY, {
                    state: {
                        RoomID: playersData.roomID,
                        isTournament: false,
                        playersData: playersData
                    }, replace: true });
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