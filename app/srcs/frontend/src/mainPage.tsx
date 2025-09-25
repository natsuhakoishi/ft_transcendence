import React, { useState, useEffect } from "react";
import toast from "react-hot-toast"
import {  Link } from "react-router-dom";
import type { User } from "../../backend/share/type/profile.ts";

type MainPageProps = {
  user: User | null;
  // friend: 
};

export function MainPage({ user }: MainPageProps) {
  useEffect(() => {
  	document.title = "Main Page";
    toast.success("Welcome back, " + user?.acc.username);
  }, []);

  return (
    <div className="">
      <button className="absolute top-0 left-0 bg-blue-500 p-2">(Profile)</button>
      <button className="absolute bottom-0 left-0 bg-blue-500 p-2">Friends</button>
      <span className="absolute bottom-0 middle-0">Credits</span>
      <button className="absolute bottom-0 right-0 bg-blue-500 p-2">Match History</button>
      <span className="absolute top-0 right-0 p-2 font-semibold">Version</span>
      <h1>yOOOOOOO!</h1>
      {user ? <h2> welcome, {user?.acc?.username} </h2> : <h2> HUH? Fk off</h2>}
      <button className="container bg-green-300">
        <p></p>
        <Link to="/game/modeSelect">Mode Select</Link>
      </button>
    </div>
  );
}
