import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "./style.css";
import { LoginPage } from "./otherPage/loginPage";
import { Home, FetchData } from "./homePage/home";
import { TMatching } from "./gamePage/matching";
import { GamePage } from "./gamePage/gamePage";
import { TournamentGamePage } from "./gamePage/TournamentGamePage";
import NotFound from "./otherPage/NotFound";
import { setUnauthorized } from "./utils";
import { FriendPage } from "./homePage/friend";
import { HistoryPage } from "./homePage/MatchHistory/history";
import { ProfilePage } from "./homePage/Profile/profile.tsx";
import { Loading } from "./gamePage/LoadingPage";
import { AIGamePage } from "./gamePage/AIGamePage";

function App() {
  const navigate = useNavigate();

  React.useEffect(() => {
    setUnauthorized(() => {
      toast.error("Session expired. Log in again!");
      setTimeout(() => {
        navigate("/auth", { replace: true });
      }, 1000 * 2);
    });
  }, []);

  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/auth" element={<LoginPage />} />
        <Route path="/" element={<FetchData />}>
          <Route index element={<Home />} />
          <Route path="/friends" element={<FriendPage />} />
          <Route path="/match_history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="/game" >
          <Route path="loading" element={<Loading />} />
          <Route path="gameplay" element={<GamePage />} />
          <Route path="tournament/*" element={<TournamentGamePage />} />
          <Route path="tournamentMatching" element={<TMatching />} />
          <Route path="AI/gameplay" element={<AIGamePage />}/>
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
