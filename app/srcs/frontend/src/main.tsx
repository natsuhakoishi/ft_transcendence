import React from "react";
import ReactDOM from "react-dom/client";
import "./input.css";
import { Searching } from "./searchingPage";

function App() {
  return <h1 className="text-3xl font-bold">Hello React + Tailwind!</h1>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <Searching />
  </React.StrictMode>
);
