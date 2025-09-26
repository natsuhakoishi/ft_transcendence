import React from "react";
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom";
import type { User } from "../../backend/share/type/user.ts";
import type { Friend } from "../../backend/share/type/friend.ts";
import { loadData, LoadingScreen, type Progress } from "./home_load"
import { Matching } from "./matching";

export function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [progress, setProgress] = React.useState<Progress>({ step: "Loading", completed: null, total: 3 });
  const [match, setMatch] = React.useState<boolean>(false);
  const [user, setUser] = React.useState<User | null>(null);
  const [friend, setFriend] = React.useState<Friend | null>(null);
  
  React.useEffect(() => {
  	// document.title += " | Main Menu";
    loadData({setLoading, setProgress, setUser, setFriend});
  }, []);

  return (
    <>
    {loading ? <LoadingScreen progress={progress}/> : 
      (match === true ? <Matching /> :
        (<div className="grid grid-cols-[1fr_2fr_1fr] h-screen w-screen">

          <div className="column-start-1 row-span-3 flex flex-col justify-between">
            <button className="bg-blue-500 w-30 p-2">{user?.acc.username}</button>
            <button className="bg-blue-500 w-30 p-2">Friends</button>
          </div>

          <div className="column-start-2 row-span-3 flex flex-col items-center">
            <div className="flex-1" />
            <div className="bg-[#A0EAFF]/75 w-[90%] h-1/2">
              <div className="grid grid-cols-2 gap-2 p-10 w-full h-full place-items-center">
                <button className="row-span-2 w-full h-full bg-sky-500"
                 onClick={() => navigate(import.meta.env.VITE_PATH_TOURNAMENT_MATCHING)}>Tournament</button>

                <button className="bg-gray-300 h-2/3 w-2/3"
                 onClick={() => setMatch(true)}>1 vs 1</button>

                <button className="bg-gray-300 h-2/3 w-2/3"
                 >AI Match</button>
              </div>
            </div>
            <div className="flex-1" />

            <span className="">Credits</span>
          </div>

          <div className="column-start-3 row-span-3 flex flex-col items-end justify-between">
            <span className="p-2 font-semibold">Version</span>
            <button className=" bg-blue-500 w-30 p-2">Match History</button>
          </div>

        </div>
      ))
    }
    </>
  );
}
