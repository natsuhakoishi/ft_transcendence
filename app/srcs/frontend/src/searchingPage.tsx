import React from "react";
import "./input.css";
import { matching } from "./matching";

export function Searching() {
    React.useEffect(() => {
    matching();
    }, []);

    return <div className="container bg-blue-500">
        <h1 className="text-5xl decoration-cyan-800">Searching...</h1>
    </div>;
}