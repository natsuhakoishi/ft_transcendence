import React from "react";
import { useLang } from "../../_hooks/language";
import type { PlayerWithProfileData } from "../../../../backend/share/type/Player";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function PlayerUsername({ name, text }: { name: string, text: string}) {
  return (
    <input className="default_placeholder w-1/4 border text-center text-xs md:text-lg bg-white/5 backdrop-blur-2xl"
      type="text" name={name} placeholder={text} required
    />
  );
}

function LocalForm({ mode, cb }: { mode: "Tour" | "Match", cb: (e: React.FormEvent<HTMLFormElement>) => void }) {
  const { t } = useLang();

  return (
    <>
      <div className="z-10 flex flex-col items-center">
        <h1>{mode === "Tour" ? t("home.btn_tour") : t("home.btn_1vs1")} - {t("home.btn_local")}</h1>
        <h1 className="text-base md:text-2xl">{t("shared.form.place_name")}</h1>
        <form className="relative flex flex-col items-center" onSubmit={cb}>
          <div className="flex justify-center gap-2 mt-5 md:mt-10 md:mb-5 text-lg">
            <PlayerUsername name="username_p1" text={t("home.place_p1")} />
            <PlayerUsername name="username_p2" text={t("home.place_p2")} />
            { mode === "Tour" &&
              <>
                <PlayerUsername name="username_p3" text={t("home.place_p3")} />
                <PlayerUsername name="username_p4" text={t("home.place_p4")} />
              </>
            }
          </div>
          <button type="submit" className="mt-3 w-11 md:w-15 aspect-square border-2 border-silver rounded-md overflow-hidden hover-increase">
            <img src="/pic/icons/next_btn.png" className="drop-shadow-lg w-full h-full object-cover"/>  
          </button>
        </form>
      </div>
    </>
  );
}

export function LocalModal({ mode }: { mode: "Tour" | "Match" }) {
  const navigate = useNavigate();
  const { toasterPluz } = useLang();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    let playersData :PlayerWithProfileData[] = [];
    const count = mode === "Tour" ? 4 : 2;
    const name = new Map<string, number>();
    for (let idx = 1; idx <= count; ++idx)
    {
      const temp = formData.get(`username_p${idx}`) as string;
      if (temp.length < 3)
      {
        toast.error(`User ${idx}`)
        toasterPluz("ERR_NameTooShort");
        return ;
      }
      if (temp.length > 8) 
      {
        toast.error(`User ${idx}`);
        toasterPluz("ERR_NameTooLong");
        return ;
      }
      if (name.has(temp))
      {
        toast.error(`User ${idx}`);
        toasterPluz("ERR_NameRepeat");
        return ;
      }
      name.set(temp,idx);
      playersData.push({ id: 0, name: temp });
    }
    // console.log(playersData);
    if (count === 4)
      console.log("这是tournament •ᴗ•");
    else
      console.log("这个是普通match •ᴗ•");
  };

	return (
      <LocalForm mode={mode} cb={(e) => handleSubmit(e)} />
  );
}