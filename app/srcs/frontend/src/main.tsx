import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./input.css";
import { Matching, matching } from "./matching";
import { GamePage } from "./gamePage";

function MainPage() {
  return (
    <div className="container bg-blue-500">
      <h1>HOME</h1>
      <div className="container bg-green-500">
        <Link to="/match">Mode select</Link>
      </div>
    </div>
  );
}

function ModeSelectPage() {
  const [page, setPage] = useState<"Match" | "Matching" | "GamePage">("Match");
  // const [page, setPage] = useState<"Match" | "Matching">("Match");
  // React.useEffect(() => {
  //   if (page === "Matching")
  //   {
  //     matching();
  //     console.log("use effect, matching");
  //   }
  // }, [page]);

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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/match" element={<ModeSelectPage />} />
        <Route path="/game" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    {/* <Matching /> */}
  {/* <MatchingButton /> */}
  </React.StrictMode>
);
