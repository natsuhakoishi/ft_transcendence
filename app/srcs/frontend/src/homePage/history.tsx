import React from "react";
import toast from "react-hot-toast";
import { apiFetchPrivate } from "../utils";

export function HistoryPage() {

  const test = async () => {
    try {
      const data = await apiFetchPrivate("match/me", { method: "GET" });
      console.log(data);
    } catch (err: any) {
      console.error(err.message);
    }
  }

	return (
    <>
      <button onClick={test}>yo</button>
    </>
  );
}