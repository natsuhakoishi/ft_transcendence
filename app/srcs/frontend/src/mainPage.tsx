import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, {Toaster } from "react-hot-toast"
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { apiFetchPrivate } from "./utils";

function LoadingScreen() {
  return (
    <button type="button" className="bg-indigo-500 text-white px-4 py-2 rounded-md flex items-center" disabled>
      <svg className="mr-3 size-5 animate-spin text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <circle cx="12" cy="4" r="1.8"></circle>
        <circle cx="19" cy="8" r="1.8"></circle>
        <circle cx="19" cy="16" r="1.8"></circle>
        <circle cx="12" cy="20" r="1.8"></circle>
        <circle cx="5" cy="16" r="1.8"></circle>
        <circle cx="5" cy="8" r="1.8"></circle>
      </svg>
      Processing…
    </button>
  );
}

export function MainPage() {
  useEffect(() => {
  	document.title = "Main Page";
  }, []);

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => { 
    async function fetchProfile() {
      try
      {
        const start = Date.now();
        const data = await apiFetchPrivate("profile", { method: "POST", body: "{}" });
        setUserData(data);
        // console.log(data);

        const elapsed = Date.now() - start;
        const minDuration = 2000;

        if (elapsed < minDuration)
          setTimeout(() => setLoading(false), minDuration - elapsed);
        else
          setLoading(false);
      } catch (err: any) {
        toast.error(err);
        console.error(err);
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <h1>yOOOOOOO!</h1>
      <button className="container bg-green-300">
        <Link to="/game/modeSelect">Mode Select</Link>
      </button>
    </div>
  );
}
//todo maybe instant fetch after login success, just hold a loading page here