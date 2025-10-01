import React, { useState } from "react";
import toast from "react-hot-toast"
import { apiFetch, apiFetchPrivate } from "../utils";
import { useNavigate, useOutletContext } from "react-router-dom";
import type { User } from "../../../backend/share/type/user";
import { MenuOption } from "./home_profile_option.";

const handleLogOut = async (navigate: (path: string) => void) => {
  try {
    await apiFetch("logout", { method: "POST", body: JSON.stringify({}) });
    toast.success("Log out.");
    navigate("/auth");
  } catch (err: any) {
    console.error("Issue: " + err.message);
    if (err.message.includes("Failed to fetch"))
      toast.error("Server Error");
    else
      toast.error(err.message);
  }
}

export function ProfilePage() {
  const navigate = useNavigate();
  const [mode, setMode] = React.useState<"Profile" | "Option">("Option");
  const { user } = useOutletContext< {user: User | null} >();

  React.useEffect(() => {
    document.title = "KLBQ | Profile";
  }, []);

	return (
		<>
		<div className="w-screen h-screen bg-gradient-to-b from-[#dbd1dc83] via-[#daade08d] to-[#f07bffb8] bg-[#A0EAFF] flex flex-col gap-2">

      <div className="flex gap-5 mt-15 ml-5">
        <button className={`border-2 p-1 transition ${mode === "Profile" && "text-white border-white"}`}
          onClick={() => setMode("Profile")}>Profile</button>
        <button className={`border-2 p-1 transition ${mode === "Option" && "text-white border-white"}`} 
          onClick={() => setMode("Option")}>Option</button>
        <button className="bg-[#E383B1] border-2 p-1" onClick={() => handleLogOut(navigate)}>Log Out</button>
      </div>

      {mode === "Profile" ? <MenuProfile user={user} /> : <MenuOption user={user}/>}

		</div>
		</>
	);
}