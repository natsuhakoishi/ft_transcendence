import React from "react";
import { Matching } from "./matching";
import { useNavigate } from "react-router-dom";

export function ModeSelectPage() {
    const navigate = useNavigate();
    // const [page, setPage] = useState<"Match" | "Matching" | "GamePage">("Match");
    const [page, setPage] = React.useState("select");

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
                <button type="button" onClick={() => navigate(import.meta.env.VITE_PATH_TOURNAMENT_MATCHING)}>Tournament</button>
                                                    {/* TODO: change correct page */}
                </div>

            </div>
            ) : (
            <Matching />
            )}
        </div>
    );
}