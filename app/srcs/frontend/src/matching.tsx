import React from "react";
import { useNavigate } from "react-router-dom";
import type { GameData } from "../../backend/share/type/gameData.ts";
import { initGameData } from "./utils.ts";

export function Matching() {
    const navigate = useNavigate();

    React.useEffect(() => {

        const ws = new WebSocket(import.meta.env.VITE_GAMEMATCHING_ROUTE);
        console.log("Matching...");
        //TODO: get user id
        // const playerID: number = 5555;
        let playerID: string | null = localStorage.getItem("playerID");
        if (!playerID) playerID = "0";

        ws.onopen = () => {
            ws.send(playerID.toString());
            console.log("sent ID");
        };

        let RoomId: string = "";
        ws.onmessage = async (event) => {
            console.log("server: " + event.data);

            const boardWidth: number = Number(import.meta.env.VITE_GAME_BOARD_WIDTH_PX);
            const boardHeight: number = Number(import.meta.env.VITE_GAME_BOARD_HEIGHT_PX);
            const paddlesHeight: number = Number(import.meta.env.VITE_GAME_PADDLES_HEIGHT_PX);
            const paddlesWidth: number = Number(import.meta.env.VITE_GAME_PADDLES_WIDTH_PX);

            const data: GameData = initGameData(event.data, Number(playerID), boardWidth, boardHeight, paddlesHeight, paddlesWidth);

            RoomId = data.roomId;

            try {
                const response = await fetch(import.meta.env.VITE_GAMEPLAY_HTTP_ROUTE, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    console.error("HTTP error: ", response.status);
                    navigate("/"); //TODO: redirect to [?] page
                    return ;
                }
                else
                    console.log("game data sent");

            } catch {
                console.log("fetch error");
            }

            navigate({
                pathname: import.meta.env.VITE_PATH_GAMEPLAY,
                search: new URLSearchParams({
                    ROOMID: RoomId,
                    PLAYERID: playerID
                }).toString(),
            });

        };

        return () => { //when user press 'back button'
            console.log("Matching: closing ws");
            ws.close();
        };
    }, []);

    return (
        <div className="container bg-blue-500">
          <h1 className="text-5xl decoration-cyan-800">Matching...</h1>
      </div>

    );
}

export function TMatching() {
    return (
        <div className="container bg-blue-500">
          <h1 className="text-5xl decoration-cyan-800">Matching...</h1>
      </div>
    );
}