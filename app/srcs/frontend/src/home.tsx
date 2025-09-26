import React from "react";
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom";
import type { User } from "../../backend/share/type/user.ts";
import type { Friend } from "../../backend/share/type/friend.ts";
import { apiFetchPrivate } from "./utils.ts";
import { Matching } from "./matching";

type Progress = {
  step: string;
  completed: number | null;
  total: number | null;
};

function LoadingScreen({ progress}: { progress: Progress }) {
  return (
    <>
      <p className="font-semibold font-serif">{progress.step}</p>
      {progress.completed !== null && <p className="">{progress.completed} / {progress.total} </p>}
      <button type="button" className="center-0 bg-indigo-500 text-white px-4 py-2 rounded-md flex items-center justify-center" disabled>
        <svg className="size-5 animate-spin text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <circle cx="12" cy="4" r="1.8"></circle>
          <circle cx="19" cy="8" r="1.8"></circle>
          <circle cx="19" cy="16" r="1.8"></circle>
          <circle cx="12" cy="20" r="1.8"></circle>
          <circle cx="5" cy="16" r="1.8"></circle>
          <circle cx="5" cy="8" r="1.8"></circle>
        </svg>
      </button>
    </>
  );
}

type ProgressObj<T> = {
  name: string;
  api: () => Promise<T>;
  setter: React.Dispatch<React.SetStateAction<T | null>> | null;
};

type fetchDataProps = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setProgress: React.Dispatch<React.SetStateAction<Progress>>,
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setFriend: React.Dispatch<React.SetStateAction<Friend | null>>
}

async function loadData({setLoading, setProgress, setUser, setFriend} :fetchDataProps ) {
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const progress: [ ProgressObj<any>, ProgressObj<User>, ProgressObj<Friend> ] =
  [
    { name: "Checking User", api: () => fetch("/api/private/me", { method: "GET" }), setter: null },
    { name: "Fetching User Data", api: () => apiFetchPrivate("profile", { method: "POST", body: "{}" }), setter: setUser },
    { name: "Fetching Friends Data", api: () => apiFetchPrivate("my_friends", { method: "POST", body: "{}"}), setter: setFriend }
  ]
  
  try {
    let who: string = "";
    for (let i = 0; i < progress.length; ++i)
    {
      const { name, api, setter } = progress[i];

      setProgress(prev => ({
        ...prev, step: name, completed: prev.completed, }));

      const data = await api();
      // console.info(data);
      if (i === 1) who = data.acc.username;
      if (setter)
        setter(data);

      setProgress(prev => ({
        ...prev, completed: prev.completed !== null ? prev.completed + 1 : 0, }));

      await sleep(500);
    }

    setProgress({ step: "Data fetching completed", completed: null, total: null });
    await sleep(500);
    setLoading(false);
    toast.success("Welcome back, " + who + ".");

  } catch (err: any) {
    console.error("Issue: " + err.message);
    if (err.message.includes("Failed to fetch"))
      toast.error("Server Error");
    else
      toast.error("Error: "+ err.message);
  }
};

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
