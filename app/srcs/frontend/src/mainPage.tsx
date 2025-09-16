import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, {Toaster } from "react-hot-toast"

async function apiFetchPrivate(endpoint: string, options: RequestInit = {}) {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string> || {}) };
  if (!(options.body instanceof FormData))
    headers["Content-Type"] = "application/json";
  return fetch(`https://localhost:4242/api/private/${endpoint}`, { ...options, headers, credentials: 'include' });
}


function LoadingScreen() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100vh', backgroundColor: '#aaccff', flexDirection: 'column'
    }}>
      <h1>Preparing... Hold on</h1>
      <p>Loading ... </p>
      <p>{count}</p>
    </div>
  );
}

export function Temp() {
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
        const res = await apiFetchPrivate("profile", { method: "POST", body: "{}" });
        const data = await res.json();
        setUserData(data);

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
    </div>
  );
}
//todo maybe instant fetch after login success, just hold a loading page here