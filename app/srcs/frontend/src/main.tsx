import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "./input.css";
import type { User } from "../../backend/share/type/user.ts"
import type { Friend } from "../../backend/share/type/friend.ts"
import { LoginPage } from "./loginPage";
import { MainPage } from "./mainPage";
import { ModeSelectPage } from "./modeSelect";
import { TMatching } from "./matching";
import { GamePage } from "./gamePage";
import { TournamentGamePage } from "./TournamentGamePage";
import NotFound from "./NotFound";
import { setUnauthorized, apiFetchPrivate } from "./utils";

export type Progress = {
  step: string;
  completed: number | null;
  total: number | null;
};

function LoadingScreen({ progress}: { progress: Progress }) {
  return (
    <>
      <p className="font-semibold">{progress.step}</p>
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
    for (let i = 0; i < progress.length; ++i)
    {
      const { name, api, setter } = progress[i];

      setProgress(prev => ({
        ...prev, step: name, completed: prev.completed, }));

      const data = await api();
      console.info(data);
      if (setter)
        setter(data);

      setProgress(prev => ({
        ...prev, completed: prev.completed !== null ? prev.completed + 1 : 0, }));

      await sleep(500);
    }

    setProgress({ step: "Data fetching completed", completed: null, total: null });
    await sleep(500);
    setLoading(false);

  } catch (err: any) {
    console.error("Issue: " + err.message);
    if (err.message.includes("Failed to fetch"))
      toast.error("Server Error");
    else
      toast.error("Error: "+ err.message);
  }
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    setUnauthorized(() => {
      toast.error("Session expired. Log in again!");
      setTimeout(() => {
        navigate("/auth");
      }, 3000);
    });
  }, []);
  
  const [loading, setLoading] = React.useState(true);
  const [progress, setProgress] = React.useState<Progress>({ step: "Loading", completed: null, total: 3 });
  const [user, setUser] = React.useState<User | null>(null);
  const [friend, setFriend] = React.useState<Friend | null>(null);

  //Usage: re-fetch trigger when route change / reload happen
  React.useEffect(() => {
    if (location.pathname === "/") {
        loadData({setLoading, setProgress, setUser, setFriend});
    }    
  }, [location.pathname]);

  return (
    <>
      <Toaster position="top-center" />
      {location.pathname === "/auth" ? <Routes> <Route path="/auth" element={<LoginPage />} /> </Routes> :
       (loading ? <LoadingScreen progress={progress} /> :
        (
          <>
          <Routes>
          <Route path="/" element={<MainPage user={user} friend={friend}/>} />
          <Route path="/game" >
            <Route path="modeSelect" element={<ModeSelectPage />} />
            <Route path="gameplay" element={<GamePage />} />
            <Route path="tournament/*" element={<TournamentGamePage />} />
            <Route path="tournamentMatching" element={<TMatching />} />
          </Route>
          <Route path="*" element={<NotFound />} />
          <Route path="/404" element={<NotFound />} />
          </Routes>
          </>
        )
      )}
    </>
   );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
    <App />
    </BrowserRouter>
);


// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <App />
//     {/* <Matching /> */}
//   {/* <MatchingButton /> */}
//     </BrowserRouter>
//   </React.StrictMode>
// );
