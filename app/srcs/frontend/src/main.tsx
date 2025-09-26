import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "./style.css";
import { LoginPage } from "./otherPage/loginPage";
import { Home } from "./homePage/home";
import { TMatching } from "./gamePage/matching";
import { GamePage } from "./gamePage/gamePage";
import { TournamentGamePage } from "./gamePage/TournamentGamePage";
import NotFound from "./otherPage/NotFound";
import { setUnauthorized } from "./utils";

function App() {
  const navigate = useNavigate();

  React.useEffect(() => {
    setUnauthorized(() => {
      toast.error("Session expired. Log in again!");
      setTimeout(() => {
        navigate("/auth");
      }, 3000);
    });
  }, []);

  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/auth" element={<LoginPage />} />
        <Route path="/" >
          <Route index element={<Home />} />
          {/* <Route path="/friend" /> */}
          {/* <Route path="/profile" /> */}
        </Route>
        <Route path="/game" >
          <Route path="gameplay" element={<GamePage />} />
          <Route path="tournament/*" element={<TournamentGamePage />} />
          <Route path="tournamentMatching" element={<TMatching />} />
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
