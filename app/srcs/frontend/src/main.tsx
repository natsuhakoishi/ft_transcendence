import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./input.css";
import { Matching } from "./matching";
import { GamePage } from "./gamePage";
import NotFound from "./NotFound";
import { LoginPage } from "./loginPage";
import { Temp } from "./mainPage";

function MainPage() {
  return (
    <div className="container bg-blue-500">
      <h1>HOME</h1>
      <div className="container bg-green-500">
        <Link to="/game/modeSelect">Mode select</Link>
      </div>
    </div>
  );
}

function ModeSelectPage() {
  // const [page, setPage] = useState<"Match" | "Matching" | "GamePage">("Match");
  const [page, setPage] = useState("select");

  return (
    <div className="container bg-blue-500">
      {page === "select" ? (
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
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/temp" element={<Temp />} />
        <Route path="/" element={<MainPage />} />
        <Route path="/game" >
          <Route path="modeSelect" element={<ModeSelectPage />} />
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
