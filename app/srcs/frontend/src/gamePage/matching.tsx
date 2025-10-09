import React from "react";
import { useNavigate } from "react-router-dom";
import { apiFetchPrivate, sendProfile } from "../utils.ts";
import type { MatchPlayersData } from "../../../backend/share/type/Matches.ts";

// const boardWidth: number = Number(import.meta.env.VITE_GAME_BOARD_WIDTH_PX);
// const boardHeight: number = Number(import.meta.env.VITE_GAME_BOARD_HEIGHT_PX);
// const paddlesHeight: number = Number(import.meta.env.VITE_GAME_PADDLES_HEIGHT_PX);
// const paddlesWidth: number = Number(import.meta.env.VITE_GAME_PADDLES_WIDTH_PX);

export function Matching({again, setMatch, AI} : {
        again: boolean,
        setMatch?: React.Dispatch<React.SetStateAction<boolean>>,
        AI: boolean
    }) {
    const navigate = useNavigate();

    React.useEffect( () => {
        if (!AI)
        {
            const ws = new WebSocket(import.meta.env.VITE_GAME_API_MATCHING);
            console.log("Matching...", import.meta.env.VITE_GAME_API_MATCHING);
    
            ws.onopen = () => {
                (async () => {
                    await sendProfile(ws, () => {
                        // navigate(import.meta.env.VITE_PATH_404NOTFOUND, { state: {msg: "G"}});
                        navigate(import.meta.env.VITE_PATH_404NOTFOUND);
                    })
                })()
            };
    
            ws.onmessage = async (event) => {
                const data: MatchPlayersData = JSON.parse(event.data);
                const playerID = await apiFetchPrivate("me", { method: "GET" });
                console.log("/Matching: ", data);
                
                console.log("/Matching: to: ", import.meta.env.VITE_GAME_PATH_GAMEPLAY_LOADING);
                navigate(import.meta.env.VITE_GAME_PATH_GAMEPLAY_LOADING, { state: {playerID: playerID, playersData: data, AI: false}, replace: true });
            };
    
            return () => { //when user press 'back button'
                console.log("Matching: closing ws");
                ws.close();
            }; 
        }
        else
        {
            const ws = new WebSocket(import.meta.env.VITE_GAME_API_AI_MATCHING);
            console.log("AI Matching...", import.meta.env.VITE_GAME_API_AI_MATCHING);

            ws.onopen = () => {
                (async () =>
                    await sendProfile(ws, () =>
                        navigate(import.meta.env.VITE_PATH_404NOTFOUND)))();
            };

            ws.onmessage = async (event) => {
                const data: MatchPlayersData = JSON.parse(event.data);
                const playerID = await apiFetchPrivate("me", { method: "GET" });
                console.log("AI Matching: ", data);

                console.log("AI matching: to", import.meta.env.VITE_GAME_PATH_GAMEPLAY_LOADING);
                navigate(import.meta.env.VITE_GAME_PATH_GAMEPLAY_LOADING, { state: {playerID: playerID, playersData: data, AI: true} });
                // navigate(import.meta.env.VITE_GAME_PATH_AI_GAMEPLAY, { state: {playersData: data} });
            };

        }
    }, []);

    return (
        <>
        <div className=" bg-blue-500">
            <h1 className="text-5xl decoration-cyan-800">{AI ? "Calling AI chan..." : "Matching..."}</h1>
        </div>
        <button
            type="submit"
            className="items-center border-black-300 border-2 rounded-lg p-1 mt-2 "
            onClick={() => {
                again ? navigate("/") : setMatch?.(false)
            }}
            >Cancel</button>
        </>
    );
}

export function TMatching() {
    const navigate = useNavigate();

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
                    navigate(import.meta.env.VITE_PATH_404NOTFOUND, { state: {msg: "H"}});
                    // navigate(import.meta.env.VITE_PATH_404NOTFOUND);
                }
            })();
        };

        ws.onmessage = async (event) => {
            console.log("server: " + event.data);

            const RoomId: string = event.data;

            navigate(import.meta.env.VITE_GAME_PATH_TOURNAMENT, { state: {tournamentRoomID: RoomId} });
        };

        return () => { //when user press 'back button'
            console.log("Matching: closing ws");
            ws.close();
        };
    }, []);

    return (
        <>
        <div className="container bg-blue-500">
            <h1 className="text-5xl decoration-cyan-800">Tournament Matching...</h1>
        </div>
        <button type="submit" className="items-center border-black-300 border-2 rounded-lg p-1 mt-2" onClick={() => navigate("/")}>Cancel</button>
        </>
    );
}
