import React, { useState } from "react";
import toast from "react-hot-toast"
import { apiFetchPrivate } from "../utils";
import type { User } from "../../../backend/share/type/user";
import { FetchData } from "./home";

const submitUsername = async (
  event: React.FormEvent<HTMLFormElement>,
  setPreviewName: React.Dispatch<React.SetStateAction<string>>,
  setToggle: React.Dispatch<React.SetStateAction<Mode>>,
  refetch: () => void
) => {
  event.preventDefault();
  const form = event.currentTarget;
  const input = form.elements.namedItem("username") as HTMLInputElement;
  const value = input.value.trim();
  if (!value) return toast.error("Empty username!");
  if (value.length < 3) return toast.error("Username length must longer than 3.");

  try {
    await apiFetchPrivate("update_username", { method: "POST", body: JSON.stringify({ username: value}) });
    setPreviewName(value);
    setToggle("");
    refetch();
    toast.success("Update username successfully.");
  } catch (err: any) {
    console.error("Issue: " + err.message);
    if (err.message.includes("Failed to fetch"))
      toast.error("Server Error");
    else
      toast.error(err.message);
  }
}

const submitPassword = async (
  event: React.FormEvent<HTMLFormElement>,
  user: User | null,
  setToggle: React.Dispatch<React.SetStateAction<Mode>>
) => {
  event.preventDefault();
  if (user?.acc.google_login) return toast.error("This feature not available for Google User"), setToggle("");
  const form = event.currentTarget;
  const new_password = (form.elements.namedItem("new_password") as HTMLInputElement).value;
  const old_password = (form.elements.namedItem("old_password") as HTMLInputElement)?.value;
  if (new_password.length < 8) return toast.error("Password length must longer than 8.");

  try {
    const data = await apiFetchPrivate("update_password", { method: "POST", body: JSON.stringify({ old_password, new_password}) });
    setToggle("");
    toast.success(data.message);
  } catch (err: any) {
    console.error("Issue: " + err.message);
    if (err.message.includes("Failed to fetch"))
      toast.error("Server Error");
    else
      toast.error(err.message);
  }
}

const avatarDelete = async (setPreview: React.Dispatch<React.SetStateAction<string>>, refetch: () => void) => {
  try {
    await apiFetchPrivate("delete_avatar", { method: "POST", body: JSON.stringify({}) });
    refetch()
    setPreview(`${import.meta.env.VITE_API_AVATAR}/default.webp?t=${Date.now()}`);
    toast.success("Avatar delete succesfully.");
  } catch (err: any) {
    console.error("Issue: " + err.message);
    if (err.message.includes("Failed to fetch"))
      toast.error("Server Error");
    else
      toast.error(err.message);
  }
}
  
const avatarUpdate = async (
  event: React.ChangeEvent<HTMLInputElement>,
  setPreview: React.Dispatch<React.SetStateAction<string>>,
  refetch: () => void
) => {
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
    refetch();
    toast.success("Update avatar successfully.");
  } catch (err: any) {
    console.error("Issue: " + err.message);
    toast.error("Failed to upload avatar.");
  }
};

type Mode = "upAvatar" | "upPass" | "upName" | "dltAvatar" | "";

export function MenuOption({ user, refetch } : {user : User | null , refetch: () => void}) {
  const [toggle, setToggle] = useState<Mode>("");
  const [preview, setPreview] = useState<string>("");
  const [previewName, setPreviewName] = useState<string>("");
  const avatarPath = user?.profile?.avatar_path || 'default.webp';
  const avatarURL = `${import.meta.env.VITE_API_AVATAR}/${avatarPath}?t=${Date.now()}`;
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const pickAvatar = () => { fileInputRef.current?.click(); }

  React.useEffect(() => {
    setPreviewName(user?.acc.username ?? "Loading..");
  }, [user]);

  return (  
    <>
    <div className="mb-10 mt-1 inset-0 w-screen h-[50%] shadow-md shadow-gray-400 gap-2 bg-[#DBE2E9]/40 backdrop-blur-md flex justify-start">

      <div className="w-[25%] h-full gap-2 flex flex-col justify-center items-center">
        <span>{previewName}</span>
        <button className="aspect-square h-1/2 rounded-full overflow-clip border-2 border-gray-300 disable" tabIndex={-1}>
          <img className="w-full h-full object-cover" src={preview || avatarURL} />
        </button>
        <button type="button" className="w-[35%] border-2 p-0.5 text-xs" onClick={() => {avatarDelete(setPreview, refetch), setToggle("dltAvatar")}}>Delete Avatar</button>
      </div>

      <div className="flex flex-col gap-2 justify-center align-middle">
        <button type="button" className="border-2 p-1" onClick={() => {pickAvatar(), setToggle("upAvatar")}}>Update Avatar</button>
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(event) => avatarUpdate(event, setPreview, refetch)}/>
        {/*feat: cancel & apply*/}
        <button type="button" className="border-2 p-1" onClick={() => setToggle("upName")}>Update Username</button>
        <button className="border-2 p-1" onClick={() => setToggle("upPass")}>Update Password</button>
      </div>

      {toggle === "upName" &&
      (<form className="flex gap-1 items-center" onSubmit={(event) => submitUsername(event, setPreviewName, setToggle, refetch)}>
        <input type="username" name="username" placeholder="Enter new username" autoComplete="off" required
          className="border rounded h-8 text-sm"
        />
        <button type="submit" className="rounded">✔</button>
        <button type="button" onClick={() => setToggle("")} className="text-sm rounded">✖</button>
      </form>)
      }

      {toggle === "upPass" &&
      (<form className="flex gap-1 items-center" onSubmit={(event) => submitPassword(event, user, setToggle)}>
        <input type="password" name="old_password" placeholder="Enter old password" autoComplete="off" required
          className="border rounded h-8 text-sm"
        />
        <input type="password" name="new_password" placeholder="Enter new password" autoComplete="off" required
          className="border rounded h-8 text-sm"
        />
        <button type="submit" className="rounded">✔</button>
        <button type="button" onClick={() => setToggle("")} className="text-sm rounded">✖</button>
      </form>)
      }
    </div>
    </>
  );
}

//todo ofc you didnt forget to proper style the button the button and the buttons right
//todo not forgetting the font & text also
//todo ofc you not forget to tweak the styling back to smth fit dark theme right
