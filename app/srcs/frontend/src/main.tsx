import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "./input.css";
import { Matching } from "./matching";
import { GamePage } from "./gamePage";
import NotFound from "./NotFound";
import { LoginPage } from "./loginPage";
import { MainPage } from "./mainPage";
import { setUnauthorized } from "./utils";
import type { ProfileResponse } from "../../backend/share/type/profile.ts"

function ModeSelectPage({user} : {user: ProfileResponse | null}) {
  // const [page, setPage] = useState<"Match" | "Matching" | "GamePage">("Match");
  const [page, setPage] = useState("select");

  console.log(user?.user.username);
  return (
    <>
    <div className="container bg-blue-500">
      {page === "select" ? (
        <div className="flex flex-col bg-blue-500">
          {user  ? <h1>{user.user.email}</h1> : <h1>aaaaaa</h1>}
          <br></br>
          <h1 className="text-5xl decoration-cyan-800">Select a mode</h1>
          <div className="container bg-green-200">
            <button type="button" onClick={() => setPage("Matching")}>AI</button> 
                                              {/* TODO: change correct page */}
          </div>
          <div className="container bg-green-200">
            <button type="button" onClick={() => setPage("Matching")}>1v1</button>
          </div>
          <div className="container bg-green-200">
            <button type="button" onClick={() => setPage("Matching")}>Tournament</button>
                                              {/* TODO: change correct page */}
          </div>

        </div>
      ) : (
        <Matching />
      )}
    </div>
    </>
  );
}

function App() {
  const navigate = useNavigate();
  useEffect(() => {
    setUnauthorized(() => {
      toast.error("Session expired. Log in again!");
      setTimeout(() => {
        navigate("/auth");
      }, 3000);
    });
  }, []);

  const [user, setUser] = useState<ProfileResponse | null>(null);
  // const [friend, setFriend] = useState<ProfileResponse | null>(null);

  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/auth" element={<LoginPage />} />
        <Route path="/" element={<MainPage 
          setUser={setUser} user={user}
        />} />
        <Route path="/game" >
          <Route path="modeSelect" element={<ModeSelectPage user={user}/>} />
          <Route path="gameplay" element={<GamePage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
        <Route path="/404" element={<NotFound />} />
      </Routes>
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
