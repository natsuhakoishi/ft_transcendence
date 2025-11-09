import React, { useState } from "react";
import { apiFetchPrivate } from "../../utils";
import type { User } from "../../../../backend/share/type/user";
import { useLang } from "../../_hooks/language";

const submitUsername = async (
  event: React.FormEvent<HTMLFormElement>,
  setPreviewName: React.Dispatch<React.SetStateAction<string>>,
  setToggle: React.Dispatch<React.SetStateAction<Mode>>,
  refetch: () => void,
  toasterPluz: (key: string) => void,
) => {

  event.preventDefault();
  const form = event.currentTarget;
  const input = form.elements.namedItem("username") as HTMLInputElement;
  const value = input.value.trim();
  if (!value) return toasterPluz("profile.ERR_NameEmpty");
  if (value.length < 3) return toasterPluz("ERR_NameTooShort");
  if (value.length > 8) return toasterPluz("ERR_NameTooLong");
 
  try {
    await apiFetchPrivate("update_username", { method: "POST", body: JSON.stringify({ username: value}) });
    setPreviewName(value);
    setToggle("");
    refetch();
    toasterPluz("profile.OK_UpName");
  } catch (err: any) {
    toasterPluz(err);
  }
}

const submitPassword = async (
  event: React.FormEvent<HTMLFormElement>,
  setToggle: React.Dispatch<React.SetStateAction<Mode>>,
  toasterPluz: (key: string) => void,
) => {

  event.preventDefault();
  const form = event.currentTarget;
  const new_password = (form.elements.namedItem("new_password") as HTMLInputElement).value;
  const old_password = (form.elements.namedItem("old_password") as HTMLInputElement)?.value;
  if (new_password.length < 8) return toasterPluz("ERR_PasswordLen");
  if (new_password === old_password) return toasterPluz("profile.ERR_PasswordSame");

  try {
    await apiFetchPrivate("update_password", { method: "POST", body: JSON.stringify({ old_password, new_password}) });
    setToggle("");
    toasterPluz("profile.OK_UpPassword");
  } catch (err: any) {
    toasterPluz(err);
  }
}
  
const avatarUpdate = async (
  event: React.ChangeEvent<HTMLInputElement>,
  setPreview: React.Dispatch<React.SetStateAction<string>>,
  refetch: () => void,
  toasterPluz: (key: string) => void,
) => {

  const file = event.target.files?.[0];
  if (!file) return;

  const allowedTypes = ["image/webp", "image/jpeg", "image/png", "image/jpg"];
  if (!allowedTypes.includes(file.type)) {
    toasterPluz("profile.ERR_UpAva_type");
    return ;
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    toasterPluz("profile.ERR_UpAva_size");
    return ;
  }

  const url = URL.createObjectURL(file);
  setPreview(url);

  try {
    const formData = new FormData();
    formData.append("avatar", file);
    await apiFetchPrivate("upload_avatar", { method: "POST", body: formData });
    refetch();
    toasterPluz("profile.OK_UpAva");
  } catch (err: any) {
    toasterPluz(err);
  }
};

const avatarDelete = async ({ setPreview, refetch, toasterPluz }: {
  setPreview: React.Dispatch<React.SetStateAction<string>>,
  refetch: () => void,
  toasterPluz: (key: string) => void;
}) => {
  try {
    await apiFetchPrivate("delete_avatar", { method: "POST", body: JSON.stringify({}) });
    refetch()
    setPreview(`${import.meta.env.VITE_API_AVATAR}/default.webp?t=${Date.now()}`);
    toasterPluz("profile.OK_DeleteAva");
  } catch (err: any) {
    toasterPluz(err);
  }
}

type Mode = "upAvatar" | "upPass" | "upName" | "dltAvatar" | "";

export function MenuOption({ user, refetch } : { user : User | null; refetch: () => void; }) {
  const { t, toasterPluz } = useLang();
  const [toggle, setToggle] = useState<Mode>("");

  const [preview, setPreview] = useState<string>("");
  const [previewName, setPreviewName] = useState<string>("");

  const avatarPath = user?.profile?.avatar_path || 'default.webp';
  const avatarURL = `${import.meta.env.VITE_API_AVATAR}/${avatarPath}?t=${Date.now()}`;
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const pickAvatar = () => { fileInputRef.current?.click(); }

  React.useEffect(() => {
    setPreviewName(user?.acc.username ?? "...");
  }, [user]);

  return (  
    <>
      {/* Left Part - Username, Avatar, btn Delete_Avatar */}
      <div className="w-[25%] h-full gap-2 flex flex-col justify-center items-center">
        {/* Username */}
        <span className="text-lg">{previewName}</span>
        {/* Avatar */}
        <button className="aspect-square h-1/2 rounded-full overflow-clip border-2 border-gray-300 disable" tabIndex={-1}>
          <img className="w-full h-full object-cover" src={preview || avatarURL} />
        </button>
        {/* Delete Avatar button */}
        <button type="button" className="rounded-sm w-[50%] border-2 p-1 hover-increase"
          onClick={async () =>  { await avatarDelete({ setPreview, refetch, toasterPluz }); setToggle("dltAvatar");} }
        >{t("profile.btn_delete_avatar")}</button>

      </div>

      {/* Right part - Button Menu */}
      <div className="flex flex-col gap-2 justify-center align-middle">
        {/* Option 1: Update Avatar */}
        <div className="flex">
          <button type="button" className="rounded-sm border-2 p-2 w-40 bg-[#AA89C4]/45 hover-increase" onClick={() => {pickAvatar(), setToggle("upAvatar")}}>{t("profile.btn_update_avatar")}</button>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(event) => avatarUpdate(event, setPreview, refetch, toasterPluz)}/>
        </div>
        {/* Option 2: Update Username */}
        <div className="flex gap-2">
          <button type="button" className="rounded-sm border-2 p-2 w-40 bg-[#AA89C4]/45 hover-increase" onClick={() => setToggle("upName")}>{t("profile.btn_update_name")}</button>
          {/* Small modal toggled when user want change username */}
          {toggle === "upName" &&
            (<form className="flex gap-1 items-center" onSubmit={(event) => submitUsername(event, setPreviewName, setToggle, refetch, toasterPluz)}>
              <input type="username" name="username" placeholder={t("shared.form.place_name")} autoComplete="off" required
                className="border rounded h-8 text-sm text-center"
              />
              <button type="submit" className="p-1 rounded text-[#7459A6]">✓</button>
              <button type="button" onClick={() => setToggle("")} className="p-1 rounded text-[#7459A6]">✘</button>
            </form>)
          }
        </div>
        {/* Option 3: Update Password */}
        <div className="flex gap-2">
          <button className="rounded-sm border-2 p-2 w-40 bg-[#AA89C4]/45 hover-increase" onClick={() => setToggle("upPass")}>{t("profile.btn_update_password")}</button>
          {/* Small modal toggled when user want change password */}
          {toggle === "upPass" &&
            (<form className="flex gap-1 items-center" onSubmit={(event) => submitPassword(event, setToggle, toasterPluz)}>

              <input type="password" name="old_password" placeholder={t("shared.form.place_o_password")} autoComplete="off" required
                className="border rounded h-8 text-sm text-center"
              />
              <input type="password" name="new_password" placeholder={t("shared.form.place_n_password")} autoComplete="off" required
                className="border rounded h-8 text-sm text-center"
              />
              <button type="submit" className="p-1 rounded text-[#7459A6]">✓</button>
              <button type="button" onClick={() => setToggle("")} className="p-1 text-sm rounded font-bold text-[#7459A6]">✘</button>

            </form>)
          }
        </div>
      </div>

    </>
  );
}
