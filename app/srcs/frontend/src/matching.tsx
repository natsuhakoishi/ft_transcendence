import React, { useEffect, useState } from "react";
import { GamePage } from "./gamePage";
// import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

export function Matching() {

    React.useEffect(() => {
        console.log("Matching: called matching");
        matching();
    }, []);

    return (
        <div className="container bg-blue-500">
          <h1 className="text-5xl decoration-cyan-800">Matching...</h1>
            {/* <GamePage /> */}
      </div>

    );
}

export function matching(): void {
    const ws = new WebSocket("ws://localhost:4242/game/match");

    console.log("Matching!");
    //TODO: get user id

    ws.onopen = () => {
        ws.send("5555");
        console.log("sent ID");
        // ws.send(playerID);
    };

    ws.onmessage = (event) => {
        console.log(event.data);
        //TODO: start game;
    };


}

