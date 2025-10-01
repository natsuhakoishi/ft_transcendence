import React, { useState } from "react";
import toast from "react-hot-toast"
import { apiFetch, apiFetchPrivate } from "../utils";
import type { User } from "../../../backend/share/type/user";

const submitUsername = async (event: React.FormEvent<HTMLFormElement>, setPreviewName: React.Dispatch<React.SetStateAction<string>>) => {
  event.preventDefault();
  const form = event.currentTarget;
  const input = form.elements.namedItem("username") as HTMLInputElement;
  const value = input.value.trim();
  if (!value) return toast.error("Empty username!");
  if (value.length < 3) return toast.error("Username length must longer than 3.");

  try {
    await apiFetchPrivate("update_username", { method: "POST", body: JSON.stringify({ username: value}) });
    setPreviewName(value);
    toast.success("Update username successfully.");
  } catch (err: any) {
    console.error("Issue: " + err.message);
    if (err.message.includes("Failed to fetch"))
      toast.error("Server Error");
    else
      toast.error(err.message);
  }
}

const submitPassword = async (event: React.FormEvent<HTMLFormElement>, user: User | null, setPassword: React.Dispatch<React.SetStateAction<boolean>>) => {
  event.preventDefault();
  if (user?.acc.google_login) return toast.error("This feature not available for Google User");
  const form = event.currentTarget;
  const new_password = (form.elements.namedItem("new_password") as HTMLInputElement).value;
  const old_password = (form.elements.namedItem("old_password") as HTMLInputElement)?.value;
  if (new_password.length < 8) return toast.error("Password length must longer than 8.");

  try {
    const data = await apiFetchPrivate("update_password", { method: "POST", body: JSON.stringify({ old_password, new_password}) });
    setPassword(false);
    toast.success(data.message);
  } catch (err: any) {
    console.error("Issue: " + err.message);
    if (err.message.includes("Failed to fetch"))
      toast.error("Server Error");
    else
      toast.error(err.message);
  }
}

const avatarDelete = async (setPreview: React.Dispatch<React.SetStateAction<string>>) => {
  try {
    await apiFetchPrivate("delete_avatar", { method: "POST", body: JSON.stringify({}) });
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

export function MenuOption({ user } : {user : User | null }) {
  const [preview, setPreview] = useState<string>("");
  const [previewName, setPreviewName] = useState<string>("");
  const avatarPath = user?.profile?.avatar_path || 'default.webp';
  const avatarURL = `${import.meta.env.VITE_API_AVATAR}/${avatarPath}?t=${Date.now()}`; 
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const pickAvatar = () => { fileInputRef.current?.click(); }
  const [username, setUsername] = useState<boolean>(false);
  const [password, setPassword] = useState<boolean>(false);

  React.useEffect(() => {
    setPreviewName(user?.acc.username ?? "Loading..");
  }, [user]);

  return (  
    <>
    <div className="mb-10 inset-0 w-screen h-[50%] gap-2 bg-[#D6D8D2]/40 backdrop-blur-sm flex justify-start">

      <div className="w-[25%] h-full gap-2 flex flex-col justify-center items-center">
        <span>{previewName}</span>
        <button className="aspect-square h-1/2 rounded-full overflow-clip border-2 border-gray-300 disable">
          <img className="w-full h-full object-cover" src={preview || avatarURL} />
        </button>
        <button type="button" className="w-[35%] border-2 p-0.5 text-xs" onClick={() => avatarDelete(setPreview)}>Delete Avatar</button>
      </div>

      <div className="flex flex-col gap-2 justify-center align-middle">
        <button type="button" className="border-2 p-1" onClick={pickAvatar}>Update Avatar</button>
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(event) => avatarUpdate(event, setPreview)}/>
        {/*feat: cancel & apply*/}
        <button type="button" className="border-2 p-1" onClick={() => {setPassword(false); setUsername(true);}}>Update Username</button>
        <button className="border-2 p-1" onClick={() => {setPassword(true); setUsername(false);}}>Update Password</button>
      </div>

      {username &&
      (<form className="flex gap-1 items-center" onSubmit={(event) => submitUsername(event, setPreviewName)}>
        <input type="username" name="username" placeholder="Enter new username" autoComplete="off" required
          className="border rounded h-8 text-sm"
        />
        <button type="submit" className="rounded">✔</button>
        <button type="button" onClick={() => setUsername(false)} className="text-sm rounded">✖</button>
      </form>)
      }

      {password &&
      (<form className="flex gap-1 items-center" onSubmit={(event) => submitPassword(event, user, setPassword)}>
        <input type="password" name="old_password" placeholder="Enter old password" autoComplete="off" required
          className="border rounded h-8 text-sm"
        />
        <input type="password" name="new_password" placeholder="Enter new password" autoComplete="off" required
          className="border rounded h-8 text-sm"
        />
        <button type="submit" className="rounded">✔</button>
        <button type="button" onClick={() => setPassword(false)} className="text-sm rounded">✖</button>
      </form>)
      }
    </div>
    </>
  );
}
