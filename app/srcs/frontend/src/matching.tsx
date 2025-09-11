import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { GameData } from "../../backend/share/type/gameData";
// import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

export function Matching() {
    const navigate = useNavigate();

    React.useEffect(() => {

        const ws = new WebSocket("ws://localhost:4242/game/match");
        console.log("Matching...");
        //TODO: get user id
        const playerID: number = 5555;

        ws.onopen = () => {
            ws.send(playerID.toString());
            console.log("sent ID");
        };

        let RoomId: string = "";
        ws.onmessage = async (event) => {
            console.log("server: " + event.data);
            const data: GameData = {
                roomId: event.data,
                playerId: playerID,
                keyPress: "//init//"
            };
            RoomId = data.roomId;

            try {
                const response = await fetch("http://localhost:4242/game/games", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok)
                    console.error("HTTP error: ", response.status);
                else {
                    console.log("game data sent");
                    navigate("/");
                }

            } catch {
                console.log("fetch error");
            }

            const queryParams: string = "ROOMID=" + RoomId + "&PLAYERID=" + playerID
            navigate("/game/match?" + queryParams);
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
