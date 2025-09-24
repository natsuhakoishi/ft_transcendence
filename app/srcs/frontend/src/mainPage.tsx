import React, { useState, useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import toast, {Toaster } from "react-hot-toast"
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { apiFetchPrivate } from "./utils";
import type { ProfileResponse } from "../../backend/share/type/profile.ts";

function LoadingScreen({ progress}: { progress: Progress }) {
  return (
    <>
      <p className="font-semibold">{progress.step}</p>
      {progress.completed !== null &&
        <p className="">{progress.completed} / {progress.total} </p>}
      <button type="button" className="bg-indigo-500 text-white px-4 py-2 rounded-md flex items-center justify-center" disabled>
        <svg className="mr-3 size-5 animate-spin text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
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

async function loadData(
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setProgress: React.Dispatch<React.SetStateAction<Progress>>,
  setUser: React.Dispatch<React.SetStateAction<ProfileResponse | null>>
) {
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const progress: [
    ProgressObj<any>,
    ProgressObj<ProfileResponse>,
    ProgressObj<void>,
  ] = [
    { name: "Checking User...", api: () => fetch("/api/private/me", { method: "GET" }), setter: null },
    { name: "Fetching User Data..", api: () => apiFetchPrivate("profile", { method: "POST", body: "{}" }), setter: setUser },
    { name: "Fetching Friends Data.", api: () => apiFetchPrivate("my_friends", { method: "POST", body: "{}"}), setter: null }
    //todo perform checking before moving next data fetching
    //todo another step of checking friends data
  ]
  try {
    let temp = "";
    for (let i = 0; i < progress.length; ++i)
    {
      const { name, api, setter } = progress[i];

      setProgress(prev => ({
        ...prev,
        step: name,
        completed: prev.completed,
      }));

      const data = await api();
      // console.info(data);
      if (setter)
        setter(data);
      if (i === 1)
        temp = data.user.username;

      setProgress(prev => ({
        ...prev,
        completed: prev.completed !== null ? prev.completed + 1 : 0,
      }));
      await sleep(1000);
    }

    setProgress({ step: "Data fetching completed.", completed: null, total: null });
    await sleep(1000);
    setLoading(false);
    toast.success("Welcome back, "+ (temp ? temp : "?"));//memo after implemetn data check
    
  } catch (err: any) {
    console.error("Issue: " + err.message);
    if (err.message.includes("Failed to fetch"))
      toast.error("Server Error");
    else
      toast.error("Error: "+ err.message);
  }
};

type Progress = {
  step: string;
  completed: number | null;
  total: number | null;
};

type MainPageProps = {
  setUser: React.Dispatch<React.SetStateAction<ProfileResponse | null>>;
  user: ProfileResponse | null;
};

export function MainPage({ setUser, user }: MainPageProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Progress>({ step: "Starting up...", completed: null, total: 3 });

  useEffect(() => {
  	document.title = "Main Page";

    const timer = setTimeout(() => {
      if (!user)
        loadData(setLoading, setProgress, setUser);
      else
        setLoading(false);
    }, 1000 * 2);

    return () => clearTimeout(timer);
  }, [user]);

  return (
    <div className="">
      {loading === true ?
        <LoadingScreen progress={progress}/> : 
        (
        <>
          <button className="absolute top-0 left-0 bg-blue-500 p-2">(Profile)</button>
          <button className="absolute bottom-0 left-0 bg-blue-500 p-2">(Profile)</button>
          <button className="absolute top-0 left-0 bg-blue-500 p-2">(Profile)</button>
          <button className="absolute top-0 left-0 bg-blue-500 p-2">(Profile)</button>
          <h1>yOOOOOOO!</h1>
          {user ? <h2> welcome, {user.user.username} </h2> : <h2> HUH? Fk off</h2>}
          <button className="container bg-green-300">
            <p></p>
            <Link to="/game/modeSelect">Mode Select</Link>
          </button>
        </>
        )}
    </div>
  );
}
