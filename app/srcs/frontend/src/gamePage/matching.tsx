import React from "react";
import { useNavigate } from "react-router-dom";
import { apiFetchPrivate, sendProfile } from "../utils.ts";
import type { MatchPlayersData } from "../../../backend/share/type/Matches.ts";
import { useLang } from "../_hooks/language.tsx";

export function Matching({again, setMatch, AI, local} : {
        again: boolean,
        setMatch?: React.Dispatch<React.SetStateAction<boolean>>,
        AI: boolean
        local: boolean
    }) {
    const navigate = useNavigate();
    const { t, toasterPluz } = useLang();

    React.useEffect( () => {
        if (!AI)
        {
            const ws = new WebSocket(import.meta.env.VITE_GAME_API_MATCHING);
            console.log("Matching...", import.meta.env.VITE_GAME_API_MATCHING);

            ws.onopen = () => {
                (async () => {
                    await sendProfile(ws, () => {
                        // navigate(import.meta.env.VITE_PATH_404NOTFOUND, { state: {msg: "G"}});
                        navigate(import.meta.env.VITE_PATH_404NOTFOUND, {replace: true});
                    })
                })()
            };

            ws.onmessage = async (event) => {
                const {success, data} = JSON.parse(event.data);
                console.dir(JSON.parse(event.data));
                if (!success || !data)
                {
                    console.log("/Matching: same player in difference match or same match");
                    toasterPluz("game.ERR_matching");
                    navigate(import.meta.env.VITE_PATH_404NOTFOUND, {replace: true});
                    return ;
                }
                // const data: MatchPlayersData = JSON.parse(event.data);
                const playerData = await apiFetchPrivate("me", { method: "GET" });
                const playerID: string = playerData.id.toString();
                console.log("/Matching: ", data);
                console.log("/Matching: ", playerID);

                console.log("/Matching: to: ", import.meta.env.VITE_GAME_PATH_GAMEPLAY_LOADING);
                if (!again)
                    navigate(import.meta.env.VITE_GAME_PATH_GAMEPLAY_LOADING, { state: {playerID: playerID, playersData: data, AI: false} });
                else
                    navigate(import.meta.env.VITE_GAME_PATH_GAMEPLAY_LOADING, { state: {playerID: playerID, playersData: data, AI: false}, replace: true });
            };

            return () => { //when user press 'back button'
                console.log("Matching: closing ws");
                ws.close();
            }; 
        }
        else if (local)
        {
            const ws = new WebSocket(import.meta.env.VITE_GAME_API_LOCAL_MATCHING);

            ws.onopen = () => {
                (async () =>
                    await sendProfile(ws, () =>
                        navigate(import.meta.env.VITE_PATH_404NOTFOUND, { replace: true})))();
            };

            ws.onmessage = async (event) => {
                const data: MatchPlayersData = JSON.parse(event.data);
                const playerData = await apiFetchPrivate("me", { method: "GET" });
                const playerID: string = playerData.id.toString();
                console.log("local Matching: ", data);

                if (!again)
                    navigate(import.meta.env.VITE_GAME_PATH_GAMEPLAY_LOADING, { state: {playerID: playerID, playersData: data, AI: true} });
                else
                    navigate(import.meta.env.VITE_GAME_PATH_GAMEPLAY_LOADING, { state: {playerID: playerID, playersData: data, AI: true}, replace: true });
                // navigate(import.meta.env.VITE_GAME_PATH_AI_GAMEPLAY, { state: {playersData: data} });
            };
        }
        else
        {
            const ws = new WebSocket(import.meta.env.VITE_GAME_API_AI_MATCHING);
            console.log("AI Matching...", import.meta.env.VITE_GAME_API_AI_MATCHING);

            ws.onopen = () => {
                (async () =>
                    await sendProfile(ws, () =>
                        navigate(import.meta.env.VITE_PATH_404NOTFOUND, { replace: true})))();
            };

            ws.onmessage = async (event) => {
                const data: MatchPlayersData = JSON.parse(event.data);
                const playerData = await apiFetchPrivate("me", { method: "GET" });
                const playerID: string = playerData.id.toString();
                console.log("AI Matching: ", data);

                console.log("AI matching: to", import.meta.env.VITE_GAME_PATH_GAMEPLAY_LOADING);
                if (!again)
                    navigate(import.meta.env.VITE_GAME_PATH_GAMEPLAY_LOADING, { state: {playerID: playerID, playersData: data, AI: true} });
                else
                    navigate(import.meta.env.VITE_GAME_PATH_GAMEPLAY_LOADING, { state: {playerID: playerID, playersData: data, AI: true}, replace: true });
                // navigate(import.meta.env.VITE_GAME_PATH_AI_GAMEPLAY, { state: {playersData: data} });
            };

        }
    }, []);

    return (
        <>
            <div className="absolute min-h-[100lvh] w-[100lvw] inset-0 -z-10 bg-[#9390B5] overflow-hidden" />
            <div className=" bg-blue-500">
                <h1 className="text-5xl decoration-cyan-800">{AI ? t("matching_AI") : t("matching_1vs1")}</h1>
            </div>
            <button
                type="submit"
                className="items-center border-black-300 border-2 rounded-lg p-1 mt-2 hover"
                onClick={() => {
                    again ? navigate("/", { replace: true }) : setMatch?.(false)
                }}
            >{t("shared.btn_cancel")}
            </button>
        </>
    );
}

export function TMatching() {
    const navigate = useNavigate();
    const { t, toasterPluz } = useLang();

    React.useEffect( () => {
        const ws = new WebSocket(import.meta.env.VITE_GAME_API_TOURNAMENT_MATCHING);
        console.log("Tournament Matching...", import.meta.env.VITE_GAME_API_TOURNAMENT_MATCHING);
        let playerID: number;

        ws.onopen = () => {
            (async () => {
                try {
                    const data = await apiFetchPrivate("me", { method: "GET" });
                    playerID = data.id;
                    console.log(playerID);
                    ws.send(playerID.toString());
                    console.log("sent ID");
                }
                catch (e) {
                    console.log("TMatching: fetch error: ", e);
                    navigate(import.meta.env.VITE_PATH_404NOTFOUND);
                }
            })();
        };

        ws.onmessage = async (event) => {
            console.log("server: " + event.data);

            const {success, RoomId} = JSON.parse(event.data);
            if (!success || !RoomId)
            {
                console.log("/TMatching: matched same account or some error");
                toasterPluz("game.ERR_matching");
                navigate(import.meta.env.VITE_PATH_404NOTFOUND, {replace: true});
                return ;
            }

            navigate(import.meta.env.VITE_GAME_PATH_TOURNAMENT, { state: {tournamentRoomID: RoomId}, replace: true });
        };

        return () => { //when user press 'back button'
            console.log("Matching: closing ws");
            ws.close();
        };
    }, []);

    return (
        <>
            <div className="container bg-blue-500">
                <h1 className="text-5xl decoration-cyan-800">{t("matching_tour")}</h1>
            </div>
            <button
                className="items-center border-black-300 border-2 rounded-lg p-1 mt-2 hover"
                type="submit"
                onClick={() => navigate("/")}
            >Cancel
            </button>
        </>
    );
}
