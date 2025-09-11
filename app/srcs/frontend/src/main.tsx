import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./input.css";
import { Matching } from "./matching";
import { GamePage } from "./gamePage";
import NotFound from "./NotFound";

function MainPage() {
  return (
    <div className="container bg-blue-500">
      <h1>HOME</h1>
      <div className="container bg-green-500">
        <Link to="/game/matching">Mode select</Link>
      </div>
    </div>
  );
}

function ModeSelectPage() {
  // const [page, setPage] = useState<"Match" | "Matching" | "GamePage">("Match");
  const [page, setPage] = useState("Match");

  return (
    <div className="container bg-blue-500">
      {page === "Match" ? (
        <div className="container bg-blue-500">
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
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/game" >
        <Route path="matching" element={<ModeSelectPage />} />
        <Route path="match" element={<GamePage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
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
