import React from "react";
import { useLang } from "../../_hooks/language";
import type { PlayerWithProfileData } from "../../../../backend/share/type/Player";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function PlayerUsername({ name, text, defaultName }: { name: string, text: string, defaultName: string }) {
  return (
    <input className="default_placeholder w-full border text-center text-xs md:text-lg bg-white/5 backdrop-blur-2xl"
      type="text" name={name} placeholder={text} defaultValue={defaultName} required
    />  
  );
}

const getName = (idx: number) => ({
  1: "Michele",
  2: "Yugiri",
  3: "Ming",
  4: "Lawine"
})[idx];

function PlayerAvatar({ avatar }: { avatar: string }) {
  return (
    <div className="relative h-10 md:h-13 aspect-square flex-shrink-0">
      <button className="aspect-square h-full rounded-full overflow-clip hover border-1 md:border-2 border-gray-300" tabIndex={-1}>
        <img className="w-full h-full object-cover" src={avatar}
          onError={(e) => {(e.currentTarget as HTMLImageElement).src = `${import.meta.env.VITE_API_AVATAR}default.webp`; }}
        />
      </button>
    </div>
  );
}

const getAvatar = (idx: number) => ({
  1: "default.webp",
  2: "yugiri_dev.webp",
  3: "ming_dev.webp",
  4: "lawine_dev.webp"
})[idx];

function LocalProfile({ idx, data }: { idx: number, data?: PlayerWithProfileData[] }) {
  if (idx < 1 || idx > 4)
    return ;

  const { t } = useLang();
  const name = `username_p${idx}`;
  const key = `home.place_p${idx}`;
  const text = t(key);
  const avatar = `${import.meta.env.VITE_API_AVATAR}${getAvatar(idx)}`

  return (
    <div className="flex flex-col items-center w-1/4 text-center gap-1">
      <PlayerAvatar avatar={avatar} />
      <PlayerUsername name={name} text={text} defaultName={data && data?.length > 0 ? data[idx-1]?.name! : getName(idx) as string}/>
    </div>
  );
};

function LocalForm({ mode, cb, data }: {
  mode: "Tour" | "Match",
  cb: (e: React.FormEvent<HTMLFormElement>) => void,
  data?: PlayerWithProfileData[],
}) {
  const { t } = useLang();

  return (
    <>
      <div className="z-10 flex flex-col items-center">
        <h1>{mode === "Tour" ? t("home.btn_tour") : t("home.btn_1vs1")} - {t("home.btn_local")}</h1>
        <h1 className="text-base md:text-lg">{t("shared.form.place_name")} !</h1>
        <form className="relative flex flex-col items-center" onSubmit={cb}>
          <div className="flex justify-center gap-2 my-2 md:my-5 text-lg">
            <LocalProfile idx={1} data={data}/>
            <LocalProfile idx={2} data={data} />
            { mode === "Tour" &&
              <>
                <LocalProfile idx={3} data={data}/>
                <LocalProfile idx={4} data={data}/>
              </>
            }
          </div>
          <button type="submit" className="w-8 md:w-12 aspect-square border-2 border-silver rounded-md overflow-hidden hover-increase">
            <img src="/pic/icons/next_btn.png" className="drop-shadow-lg w-full h-full object-cover"/>  
          </button>
        </form>
      </div>
    </>
  );
}

export function LocalModal({ mode, data }: { mode: "Tour" | "Match", data?: PlayerWithProfileData[] }) {
  const navigate = useNavigate();
  const { t, toasterPluz } = useLang();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    let playersData :PlayerWithProfileData[] = data && data.length > 0 ? data : [];
    const count = mode === "Tour" ? 4 : 2;
    if (data?.length === 0)
    {
      console.log("new local data creating");
      const name = new Map<string, number>();
      for (let idx = 1; idx <= count; ++idx)
      {
        const temp = formData.get(`username_p${idx}`) as string;
        if (temp.length < 3)
        {
          toast.error(t(`home.place_p${idx}`))
          toasterPluz("ERR_NameTooShort");
          return ;
        }
        if (temp.length > 8) 
        {
          toast.error(t(`home.place_p${idx}`))
          toasterPluz("ERR_NameTooLong");
          return ;
        }
        if (name.has(temp))
        {
          toast.error(t(`home.place_p${idx}`))
          toasterPluz("ERR_NameRepeat");
          return ;
        }
        name.set(temp,idx);
        playersData.push({ id: 0, name: temp, avatar: getAvatar(idx) });
      }
    }
    // console.log(playersData);

    if (count === 4)
      navigate(import.meta.env.VITE_GAME_PATH_LOCAL_TOURNAMENT_MATCHING, {
        state: {
          playersData: playersData
        },
        replace: true
      })
    else
      navigate(import.meta.env.VITE_GAME_PATH_MATCHING, {
        state: {
          playersData: playersData,
          mode: "local"
        },
        replace: true
      })
  };

	return (
      <LocalForm mode={mode} cb={(e) => handleSubmit(e)} data={data}/>
  );
}