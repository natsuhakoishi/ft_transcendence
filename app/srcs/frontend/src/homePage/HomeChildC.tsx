import React from "react";
import { useLang } from "../_hooks/language";
import { useNavigate } from "react-router-dom";
import type { PlayerWithProfileData } from "../../../backend/share/type/Player";
import toast from "react-hot-toast";

// Loading Screen

export type Progress = {
  step: string;
  completed: number | null;
  total: number | null;
};

export function LoadingScreen({ progress}: { progress: Progress }) {
  return (
    <div className="flex flex-col items-center">
      <p className="flex items-center gap-2 font-semibold text-xl">
        {progress.completed !== null && (<span className="">{progress.completed} / {progress.total}:</span>)}
        <span className="font-serif italic">{progress.step}</span>
      </p>
      <button type="button" className="px-4 py-2 flex items-center justify-center" disabled>
        <svg className="size-5 animate-spin text-white text-lg" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="4" r="1.8"></circle>
          <circle cx="19" cy="8" r="1.8"></circle>
          <circle cx="19" cy="16" r="1.8"></circle>
          <circle cx="12" cy="20" r="1.8"></circle>
          <circle cx="5" cy="16" r="1.8"></circle>
          <circle cx="5" cy="8" r="1.8"></circle>
        </svg>
      </button>
    </div>
  );
}

// Credit Modal

function CreditMember({ link, github, intra, roles }: { link: string, github: string, intra: string, roles: string}) {
  return (
    <div className="flex w-full gap-2 items-center">
      <img className="w-16 md:w-20 aspect-square rounded-sm border-2 p-1.5" src={link} />
      <div className="font-semibold ">
        <span className="text-[18px] md:text-[20px] font-inter font-bold leading-[150%] text-silver
          [text-shadow:1px_1px_2px_rgba(80,80,80,0.8),-1px_-1px_2px_rgba(200,200,200,0.9)]">{github}</span>
        <p className="mb-2 text-base italic text-[#848A98]">{intra}</p>
      </div>
      <div className="flex-1" />
      <div className="text-base md:text-lg">{roles}</div>
      <div className="flex-1" />
    </div>
  );
}

export function Credit({ onClick }: { onClick: () => void }) {
  const { t } = useLang();

  return (
    //{/* Background Layer -> blur effect */}
    <div className="p-0.5 fixed inset-0 z-50 flex flex-col items-center justify-center gap-1 bg-gray-600/40" onClick={onClick}>

    {/* Modal -> Credit */}
    <div className="p-1 h-[99%] w-[80%] md:w-[65%] md:h-[68%] relative flex flex-col justify-center md:gap-3 bg-gray-300/60 backdrop-blur-lg border-1 rounded-4xl" onClick={(e) => e.stopPropagation()}>
      {/* Title */}
      <h1 className="text-xl md:text-2xl text-center">{t("home.btn_credit")}</h1>
      {/* Team Credit list */}
      <div className="flex flex-col gap-1 md:gap-3 items-start mx-5 md:mx-10">

        {/* First */}
        <CreditMember link="/pic/e.png" github="Natsuha" intra="yyean-wa" roles={t("home.role_en")} />

        {/* Second */}
        <CreditMember link="/pic/yb.png" github="Yabi" intra="yyan-bin" roles={t("home.role_yb")} />

        {/* Third */}
        <CreditMember link="/pic/zw.png" github="Night" intra="zgoh" roles={t("home.role_zw")} />

      </div>
      <div className="mt-2 md:mt-1 text-xs md:text-sm text-center">Asset ©iDreamSky | React · Tailwind CSS · TS · Fastify · Node.js | Team ft_klbq</div>
    </div>

    </div>
  );
}

// Tutorial Modal

export function Tutorial({ onClick }: { onClick: () => void }) {
  const { t } = useLang();
  const [toggle, setToggle] = React.useState<"first" | "second">("first");

  return (
    //{/* Background Layer -> blur effect */}
    <div className="p-0.5 fixed inset-0 h-screen w-screen z-50 flex md:flex-col items-center justify-center gap-2 md:gap-1 bg-gray-600/40 backdrop-blur-xs overflow-auto" onClick={(e) => e.stopPropagation()}>
      {/* Img - Tutorial */}
      <div className="w-[69%] md:w-[60%] max-h-[95vh] flex flex-col items-center rounded-2xl">
        <h1 className="text-3xl font-bold text-shadow-lg text-center sm:mt-1 mb-1 md:mb-5">{t("home.tutor")}</h1>
        <img className="w-full h-[80%] object-contain rounded-2xl" src={`${toggle === "first" ? "/pic/tutorial.png" : "/pic/tutorial_2.png"}`} />
      </div>
      <div className="flex flex-col md:flex-row md:gap-2 md:items-start md:mt-2">
        <button className="mt-3 w-11 md:w-15 aspect-square border-2 border-silver rounded-md overflow-hidden hover-increase" onClick={() => setToggle(toggle === "first" ? "second" : "first")}>
          <img src={`${toggle === "first" ? "/pic/icons/next_btn.png" : "/pic/icons/back_btn.png" }`} className="drop-shadow-lg w-full h-full object-cover"/>  
        </button>
        <button className="mt-3 w-11 md:w-15 aspect-square border-2 border-silver rounded-md overflow-hidden hover-increase" onClick={onClick}>
          <img src="/pic/icons/home_btn.png" className="drop-shadow-lg w-full h-full object-cover"/>  
        </button>
      </div>
    </div>
  );
}

// Game Mode Modal

export function GameMode({ onClick, GameM, setMatch, setAI }: {
  onClick: React.Dispatch<React.SetStateAction<"Tour" | "Match" | "TourL" | "MatchL" | "">>,
  GameM: "Tour" | "Match" | "TourL" | "MatchL" | "",
  setMatch: React.Dispatch<React.SetStateAction<boolean>>,
  setAI: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const navigate = useNavigate();
  const { t, toasterPluz } = useLang();

  const handleLocalName = (e: React.FormEvent<HTMLFormElement>, count: number) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    let playersData :PlayerWithProfileData[] = [];
    const name = new Map<string, number>();
    for (let idx = 1; idx <= count; ++idx)
    {
      const temp = formData.get(`username_p${idx}`) as string;
      if (temp.length < 3) return (toast.error(`User ${idx}`), toasterPluz("ERR_NameTooShort"));
      if (temp.length > 8) return (toast.error(`User ${idx}`), toasterPluz("ERR_NameTooLong"));
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
    <div className="relative h-screen w-screen z-50" onClick={ GameM === "Tour" || GameM === "Match" ? () => onClick("") : ( GameM === "TourL" ? () => onClick("Tour") : () => onClick("Match")) }>

    <div className="absolute inset-0 backdrop-blur-xs" />
      <div className="flex w-1/2 h-1/2 translate-1/2 p-3 gap-0.5 justify-center items-center" onClick={(e) => e.stopPropagation()}>
      <div className="absolute inset-0 bg-[#F5CFED]/40 border border-[#b69bb0]/60 rounded-4xl" />
        
      { GameM === "Tour" &&
        <>
          {/* Button -> Remote Tournament */}
          <button className="py-5 w-1/3 mx-0.5 border-1 border-[#7F477F]/50 backdrop-blur-lg bg-[#925192]/50 rounded-2xl hover-increase hover:mx-2 transition-all hover:brightness-110 hover:backdrop-blur-none"
            onClick={() => navigate(import.meta.env.VITE_GAME_PATH_TOURNAMENT_MATCHING)}
          >{t("home.btn_tour")}</button>
          {/* Button -> Local Tournament */}
          <button className="py-5 w-1/3 mx-0.5 border-1 border-[#7F477F]/50 backdrop-blur-lg bg-[#925192]/50 rounded-2xl hover-increase hover:mx-2 transition-all hover:brightness-110 hover:backdrop-blur-none"
          onClick={() => onClick("TourL")}
          >{t("home.btn_local")}</button>
        </>
      }
      { GameM === "TourL" &&
        <>
          <div className="z-10 flex flex-col items-center">
            <h1>{t("home.btn_tour")} - {t("home.btn_local")}</h1>
            <h1 className="text-lg">{t("shared.form.place_name")}</h1>
            <form className="relative flex flex-col items-center" onSubmit={(e) => handleLocalName(e,4)}>
              <div className="flex justify-center gap-2 mt-10 mb-5 text-lg">
                <input className="default_placeholder w-1/4 border text-center bg-white/5 backdrop-blur-2xl"
                  type="text" name="username_p1" placeholder="Player 1" required
                />       
                <input className="default_placeholder w-1/4 border text-center bg-white/5 backdrop-blur-2xl"
                  type="text" name="username_p2" placeholder="Player 2" required
                />       
                <input className="default_placeholder w-1/4 border text-center bg-white/5 backdrop-blur-2xl"
                  type="text" name="username_p3" placeholder="Player 3" required
                />       
                <input className="default_placeholder w-1/4 border text-center bg-white/5 backdrop-blur-2xl"
                  type="text" name="username_p4" placeholder="Player 4" required
                />
              </div>
              <button type="submit" className="mt-3 w-11 md:w-15 aspect-square border-2 border-silver rounded-md overflow-hidden hover-increase">
                <img src="/pic/icons/next_btn.png" className="drop-shadow-lg w-full h-full object-cover"/>  
              </button>
            </form>
          </div>
        </>
      }

      { GameM === "Match" &&
        <>
          {/* Button -> 1 vs 1 Mode */}
          <button className="py-5 w-1/3 mx-0.5 border-1 border-[#F5CFED]/30 backdrop-blur-lg bg-[#BF91B2]/50 rounded-2xl hover-increase hover:mx-2 transition-all hover:brightness-110 hover:backdrop-blur-none"
          onClick={() => { setMatch(true); setAI(false); }}>{t("home.btn_1vs1")}</button>
          {/* Button -> AI Mode */}
          <button className="py-5 w-1/3 mx-0.5 border-1 border-[#F5CFED]/30 backdrop-blur-lg bg-[#BF91B2]/50 rounded-2xl hover-increase hover:mx-2 transition-all hover:brightness-110 hover:backdrop-blur-none"
          onClick={() => { setMatch(true); setAI(true); }}>{t("home.btn_AI")}</button>
          {/* Button -> Local Mode */}
          <button className="py-5 w-1/3 mx-0.5 border-1 border-[#F5CFED]/30 backdrop-blur-lg bg-[#BF91B2]/50 rounded-2xl hover-increase hover:mx-2 transition-all hover:brightness-110 hover:backdrop-blur-none"
          onClick={() => onClick("MatchL")}
          >{t("home.btn_local")}</button>
        </>
      }

      { GameM === "MatchL" &&
        <>
          <div className="z-10 flex flex-col items-center">
            <h1>{t("home.btn_1vs1")} - {t("home.btn_local")}</h1>
            <h1 className="text-lg">{t("shared.form.place_name")}</h1>
            <form className="relative flex flex-col items-center" onSubmit={(e) => handleLocalName(e,2)}>
              <div className="flex justify-center gap-2 mt-10 mb-5 text-lg">
                <input className="default_placeholder w-1/4 border text-center bg-white/5 backdrop-blur-2xl"
                  type="text" name="username_p1" placeholder="Player 1" required
                />       
                <input className="default_placeholder w-1/4 border text-center bg-white/5 backdrop-blur-2xl"
                  type="text" name="username_p2" placeholder="Player 2" required
                />
              </div>
              <button type="submit" className="mt-3 w-11 md:w-15 aspect-square border-2 border-silver rounded-md overflow-hidden hover-increase">
                <img src="/pic/icons/next_btn.png" className="drop-shadow-lg w-full h-full object-cover"/>  
              </button>
            </form>
          </div>
        </>
      }

      </div>
    </div>
  );
}