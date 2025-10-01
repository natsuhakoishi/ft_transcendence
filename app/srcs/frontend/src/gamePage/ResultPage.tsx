import { Link, useNavigate } from "react-router-dom";
import type { GameScore } from "../../../backend/share/type/gameState";
import type { MatchPlayersData } from "../../../backend/share/type/Matches";
import { Player } from "./player";
import React from "react";
import { Matching } from "./matching";

export function Result({ score, playersData, me }: { score: GameScore, playersData?: MatchPlayersData, me: boolean}) {
    const [ again, setAgain ] = React.useState(false);
    const navigate = useNavigate();

    return (
        <>
            {
                again ? <Matching again={true} /> : (
                <div className="relative flex flex-col items-center justify-center w-full h-screen bg-black-500"  >

                    <div className="flex" >
                        <h1 className={`text-5xl font-bold mb-6`} >Winner!</h1>
                    </div>
                    <div className="flex items-center space-x-4 mb-12">
                        <Player player={score.p1Score < score.p2Score ? playersData?.Players[0] : playersData?.Players[1]} me={me}  />
                    </div>

                    <div className="absolute bottom-6 left-100 text-black px-6 py-3 rounded">
                        <button className="items-center border-black-300 border-2 rounded-lg p-1 mt-2" onClick={() => setAgain(true)}>New Game</button>
                    </div>

                    <div className="absolute bottom-6 right-100 text-black px-6 py-3 rounded">
                        <button className="items-center border-black-300 border-2 rounded-lg p-1 mt-2" onClick={() => navigate("/")}>Home</button>
                    </div>

                </div>
                )}
        </>
    );
}