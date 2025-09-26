import React from "react";
import toast from "react-hot-toast"
import { apiFetchPrivate } from "../utils.ts";
import type { User } from "../../../backend/share/type/user.ts";
import type { Friend } from "../../../backend/share/type/friend.ts";

export type Progress = {
  step: string;
  completed: number | null;
  total: number | null;
};

export function LoadingScreen({ progress}: { progress: Progress }) {
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

export async function loadData({setLoading, setProgress, setUser, setFriend} :fetchDataProps ) {
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
      console.info(data);
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