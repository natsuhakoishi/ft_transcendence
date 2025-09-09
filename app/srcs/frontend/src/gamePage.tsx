import React from "react";

export function GamePage() {
    console.log("GamePage");

    return (
        <div className="container bg-green-500">
            <h1 className="text-5xl">Game</h1>
            <canvas className="w-200 h-100 bg-red-300" ></canvas>
        </div>
    )
}