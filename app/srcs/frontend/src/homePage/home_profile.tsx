import toast from "react-hot-toast"
import { apiFetch, apiFetchPrivate } from "../utils";
import { useNavigate, useOutletContext } from "react-router-dom";
import React, { useState } from "react";
import type { Friend } from "../../../backend/share/type/friend";
import type { User } from "../../../backend/share/type/user";

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

const usernameUpdate = async () => {
  
}

const avatarDelete = async (setPreview: React.Dispatch<React.SetStateAction<string>>) => {
  try {
    await apiFetchPrivate("delete_avatar", { method: "POST", body: JSON.stringify({}) });
    setPreview("");
    toast.success("Avatar delete succesfully.");
  } catch (err: any) {
    console.error("Issue: " + err.message);
    if (err.message.includes("Failed to fetch"))
      toast.error("Server Error");
    else
      toast.error(err.message);
  }
}

const avatarUpdate = async (event: React.ChangeEvent<HTMLInputElement>, setPreview: React.Dispatch<React.SetStateAction<string>>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const allowedTypes = ["image/webp", "image/jpeg", "image/png", "image/jpg"];
  if (!allowedTypes.includes(file.type)) {
    toast.error("File type not support. Only: webp, jpeg, jpg, png");
    return ;
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    toast.error("File too large! Size < 10MB");
    return ;
  }

  const url = URL.createObjectURL(file);
  setPreview(url);

  try {
    const formData = new FormData();
    formData.append("avatar", file);

    await apiFetchPrivate("upload_avatar", { method: "POST", body: formData });
    toast.success("Update avatar successfully.");
  } catch (err: any) {
    console.error("Issue: " + err.message);
    toast.error("Failed to upload avatar.");
  }
};

export function MenuProfile({ user } : {user : User | null }) {
  const [preview, setPreview] = useState<string>("");
  const avatarPath = user?.profile?.avatar_path || 'default.webp';
  const avatarURL = `${import.meta.env.VITE_API_AVATAR}/${avatarPath}?t=${Date.now()}`; 
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const pickAvatar = () => { fileInputRef.current?.click(); }

  return (  
    <>
    <div className="mb-10 inset-0 w-screen h-[50%] bg-white/40 backdrop-blur-sm flex justify-start">
      <div className="w-[25%] h-full gap-2 flex flex-col justify-center items-center">
        <button className="aspect-square h-1/2 rounded-full overflow-clip border-2 border-gray-300 disable">
          <img className="w-full h-full object-cover" src={preview || avatarURL} />
        </button>
        <button className="w-[35%] border-2 p-0.5 text-xs" onClick={() => avatarDelete(setPreview)}>Delete Avatar</button>
      </div>

      <div className="flex flex-col gap-2 justify-center align-middle">
        <button className="border-2 p-1" onClick={pickAvatar}>Update Avatar</button>
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(event) => avatarUpdate(event, setPreview)}/>
        {/*feat: cancel & apply*/}
        <button className="border-2 p-1" onClick={usernameUpdate}>Update Username</button>
        <p>{user?.acc.username}</p>
        {/* <button className="border-2 p-1" onClick={passwordUpdate}>Update Password</button> */}
      </div>
    </div>
    </>
  );
}

type SharedData = {
  user: User | null;
  friend: Friend | null;
};

export function ProfilePage() {
  const navigate = useNavigate();
  const [mode, setMode] = React.useState<"Profile" | "Option">("Profile");
  const { user } = useOutletContext<SharedData>();

  React.useEffect(() => {
    document.title = "KLBQ | Profile";
  }, []);

	return (
		<>
		<div className="w-screen h-screen bg-gradient-to-b from-[#daade083] via-[#daade08d] to-[#f07bffb8] bg-[#A0EAFF] flex flex-col gap-2">

      <div className="flex gap-5 mt-15 ml-5">
        <button className="border-2 p-1" onClick={() => setMode("Profile")}>Profile</button>
        <button className="border-2 p-1" onClick={() => setMode("Option")}>Option</button>
        <button className="bg-[#E383B1] border-2 p-1" onClick={() => handleLogOut(navigate)}>Log Out</button>
      </div>

      {/* <section className="mb-10 inset-0 w-screen h-[55%] bg-white/40 backdrop-blur-sm flex justify-start"> */}
      {mode === "Profile" ? <MenuProfile user={user} /> : <MenuOption />}
      {/* </section> */}

		</div>
		</>
	);
}