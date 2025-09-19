import { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./input.css";
import { TMatching } from "./matching";
import { GamePage } from "./gamePage";
import NotFound from "./NotFound";
import { LoginPage } from "./loginPage";
import { MainPage } from "./mainPage";
import { TournamentGamePage } from "./TournamentGamePage";
import { ModeSelectPage } from "./modeSelect";

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MainPage />} />
        <Route path="/game" >
          <Route path="modeSelect" element={<ModeSelectPage />} />
          <Route path="gameplay" element={<GamePage />} />
          <Route path="tournament" element={<TournamentGamePage />} />
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
