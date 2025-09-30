import React from "react";
import toast from "react-hot-toast"
import { replace, useNavigate, Outlet, useOutletContext } from "react-router-dom";
import type { User } from "../../../backend/share/type/user.ts";
import type { Friend } from "../../../backend/share/type/friend.ts";
import { loadData, LoadingScreen, type Progress } from "./home_load.tsx"
import { Matching } from "../gamePage/matching.tsx";
import { FriendPage } from "./home_friend.tsx";

export function HomeData() {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [progress, setProgress] = React.useState<Progress>({ step: "Loading", completed: null, total: 3 });
  const [user, setUser] = React.useState<User | null>(null);
  const [friend, setFriend] = React.useState<Friend | null>(null);

  React.useEffect(() => {
    loadData({ setLoading, setProgress, setUser, setFriend });
  }, []);

  return (
    <Outlet context={{ user, friend, loading, progress }} />
  );
}

export type SharedData = {
  user: User | null;
  friend: Friend | null;
  loading: boolean;
  progress: Progress;
};

export function Home() {
  const navigate = useNavigate();
  const { user, loading, progress } = useOutletContext<SharedData>();
  const [match, setMatch] = React.useState<boolean>(false);
  
  React.useEffect(() => {
  	document.title = "KLBQ | Main Menu";
  }, []);

  React.useEffect(() => {
    if (user && !loading)
      toast.success("Welcome back, " + user.acc.username + ".");
  }, [user, loading]);

  return (
    <>
    {loading ? <LoadingScreen progress={progress}/> : 
      (match === true ? <Matching setMatch={setMatch} /> :
        (<div className="grid grid-cols-[1fr_2fr_1fr] h-screen w-screen">

          <div className="column-start-1 row-span-3 flex flex-col justify-between">
            <div className="flex gap-2 mx-1 my-1">
              <button className="w-12 h-12 rounded-full overflow-clip border-2 border-gray-300/50 flex items-center justify-center hover:scale-95 transition-transform"
                onClick={() => navigate(import.meta.env.VITE_PATH_PROFILE)}>
                <img className="w-full h-full object-cover bg-[#A1CAA8]" />
              </button>
              <h2 className="my-1 font-mono text-blue-900">{user?.acc.username}</h2>
            </div>
            <button className="bg-blue-500 w-30 p-2" onClick={() => navigate(import.meta.env.VITE_PATH_FRIEND)}>Friends</button>
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
