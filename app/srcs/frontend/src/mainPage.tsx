import React from "react";
import toast from "react-hot-toast"
import {  Link } from "react-router-dom";
import type { User } from "../../backend/share/type/user.ts";
import type { Friend } from "../../backend/share/type/friend.ts";

type MainPageProps = {
  user: User | null;
  friend: Friend | null;
};

export function MainPage({user, friend}: MainPageProps) {
  React.useEffect(() => {
  	document.title = "Main Page";
    toast.success("Welcome back, " + user?.acc.username);
  }, []);

  return (
    <div className="">
      <h1>{friend?.status}</h1>
      <button className="absolute top-0 left-0 bg-blue-500 w-30 p-2">{user?.acc.username}</button>
      <button className="absolute bottom-0 left-0 bg-blue-500 w-30 p-2">Friends</button>
      <span className="absolute bottom-0 middle-0 ">Credits</span>
      <button className="absolute bottom-0 right-0 bg-blue-500 w-30 p-2">Match History</button>
      <span className="absolute top-0 right-0 p-2 font-semibold">Version</span>
      <button className="container bg-green-300">
        <Link to="/game/modeSelect">Mode Select</Link>
      </button>
    </div>
  );
}
