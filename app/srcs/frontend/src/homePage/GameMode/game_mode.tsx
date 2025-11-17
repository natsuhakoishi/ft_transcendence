import React from "react";
import toast from "react-hot-toast";
import { useLang } from "../../_hooks/language";
import { useNavigate } from "react-router-dom";
import type { PlayerWithProfileData } from "../../../../backend/share/type/Player";
import { Matching } from "../../gamePage/matching";

function ModeModal({ mode, setGameM }: { mode: "Tour" | "Match", setGameM: () => void }) {
  const navigate = useNavigate();
  const { t } = useLang();
  const [match, setMatch] = React.useState<React.ReactNode>(null);

  return (
    <>

    {match}

    { mode === "Tour" ?
    <>
      {/* Button -> Remote Tournament */}
      <button onClick={() => navigate(import.meta.env.VITE_GAME_PATH_TOURNAMENT_MATCHING)}
        className="py-5 w-1/3 mx-0.5 border-1 border-[#7F477F]/50 backdrop-blur-lg bg-[#925192]/50 rounded-2xl hover-increase hover:mx-2 transition-all hover:brightness-110 hover:backdrop-blur-none">
        {t("home.btn_online")}
      </button>

      {/* Button -> Local Tournament */}
      <button onClick={setGameM}
        className="py-5 w-1/3 mx-0.5 border-1 border-[#7F477F]/50 backdrop-blur-lg bg-[#925192]/50 rounded-2xl hover-increase hover:mx-2 transition-all hover:brightness-110 hover:backdrop-blur-none">
        {t("home.btn_local")}
      </button>
    </>
      :
    <>
      {/* Button -> Online Mode */}
      <button onClick={() => setMatch(<Matching again={false} setMatch={() => setMatch(null)} AI={false} />)}
        className="py-5 w-1/3 mx-0.5 border-1 border-[#F5CFED]/30 backdrop-blur-lg bg-[#BF91B2]/50 rounded-2xl hover-increase hover:mx-2 transition-all hover:brightness-110 hover:backdrop-blur-none">
        {t("home.btn_online")}
      </button>
      
      {/* Button -> AI Mode */}
      <button onClick={() => setMatch(<Matching again={false} setMatch={() => setMatch(null)} AI={true} />)}
        className="py-5 w-1/3 mx-0.5 border-1 border-[#F5CFED]/30 backdrop-blur-lg bg-[#BF91B2]/50 rounded-2xl hover-increase hover:mx-2 transition-all hover:brightness-110 hover:backdrop-blur-none">
        {t("home.btn_AI")}
      </button>

      {/* Button -> Local Mode */}
      <button onClick={setGameM}
        className="py-5 w-1/3 mx-0.5 border-1 border-[#F5CFED]/30 backdrop-blur-lg bg-[#BF91B2]/50 rounded-2xl hover-increase hover:mx-2 transition-all hover:brightness-110 hover:backdrop-blur-none">
        {t("home.btn_local")}
      </button>
    </>
    }

    </>
  );
};

function MatchMode({ setGameM, GameM }: {
  setGameM: React.Dispatch<React.SetStateAction<"Tour" | "Match" | "TourL" | "MatchL" | "">>,
  GameM: "Tour" | "Match" | "TourL" | "MatchL" | "",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={ GameM === "Tour" || GameM === "Match" ? () => setGameM("") : ( GameM === "TourL" ? () => setGameM("Tour") : () => setGameM("Match")) }>

    <div className="absolute inset-0 backdrop-blur-xs" />
    <div className="relative top-0 w-[60%] md:w-[40%] h-[60%] flex p-3 gap-0.5 justify-center items-center" onClick={(e) => e.stopPropagation()}>
      <div className="absolute inset-0 bg-[#F5CFED]/40 border border-[#b69bb0]/60 rounded-4xl" />

      { GameM === "Tour" && <ModeModal mode={"Tour"} setGameM={() => setGameM("TourL")} /> }
      { GameM === "TourL" &&
        <>
          <div className="z-10 flex flex-col items-center">
            <h1>{t("home.btn_tour")} - {t("home.btn_local")}</h1>
            <h1 className="text-lg">{t("shared.form.place_name")}</h1>
            <form className="relative flex flex-col items-center" onSubmit={(e) => handleLocalName(e,4)}>
              <div className="flex justify-center gap-2 mt-10 mb-5 text-lg">
                <input className="default_placeholder w-1/4 border text-center bg-white/5 backdrop-blur-2xl"
                  type="text" name="username_p1" placeholder={t("home.place_p1")} required
                />       
                <input className="default_placeholder w-1/4 border text-center bg-white/5 backdrop-blur-2xl"
                  type="text" name="username_p2" placeholder={t("home.place_p2")} required
                />       
                <input className="default_placeholder w-1/4 border text-center bg-white/5 backdrop-blur-2xl"
                  type="text" name="username_p3" placeholder={t("home.place_p3")} required
                />       
                <input className="default_placeholder w-1/4 border text-center bg-white/5 backdrop-blur-2xl"
                  type="text" name="username_p4" placeholder={t("home.place_p4")} required
                />
              </div>
              <button type="submit" className="mt-3 w-11 md:w-15 aspect-square border-2 border-silver rounded-md overflow-hidden hover-increase">
                <img src="/pic/icons/next_btn.png" className="drop-shadow-lg w-full h-full object-cover"/>  
              </button>
            </form>
          </div>
        </>
      }

      { GameM === "Match" && <ModeModal mode={"Match"} setGameM={() => setGameM("MatchL")} /> }

      { GameM === "MatchL" &&
        <>
          <div className="z-10 flex flex-col items-center">
            <h1>{t("home.btn_1vs1")} - {t("home.btn_local")}</h1>
            <h1 className="text-lg">{t("shared.form.place_name")}</h1>
            <form className="relative flex flex-col items-center" onSubmit={(e) => handleLocalName(e,2)}>
              <div className="flex justify-center gap-2 mt-10 mb-5 text-lg">
                <input className="default_placeholder w-1/4 border text-center bg-white/20 backdrop-blur-2xl"
                  type="text" name="username_p1" placeholder={t("home.place_p1")}  required
                />       
                <input className="default_placeholder w-1/4 border text-center bg-white/20 backdrop-blur-2xl"
                  type="text" name="username_p2" placeholder={t("home.place_p2")}  required
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

export function GameMode({ TutorOn, setGameM, gameM }: {
  TutorOn: () => void,
  setGameM: React.Dispatch<React.SetStateAction<"Tour" | "Match" | "TourL" | "MatchL" | "">>,
  gameM: "Tour" | "Match" | "TourL" | "MatchL" | "",
}) {
  const { t } = useLang();

	return (
    <>
      <div className="relative top-1/4 w-full h-[60%] md:h-1/2 rounded-4xl bg-[#F5CFED]/40">
      { gameM !== "" ?
        <div className="p-6 md:p-10 w-full h-full">
          <MatchMode setGameM={setGameM} GameM={gameM} />
        </div>
      :
        <>
          <div className="grid grid-cols-2 justify-items-center p-6 md:p-10 w-full h-full">
            {/* Button -> Tournament Mode */}
            <button className="w-[95%] border-1 border-[#7F477F]/50 bg-[#925192]/50 backdrop-blur-sm rounded-2xl hover-increase hover:mr-1"
              onClick={() => setGameM("Tour")}>{t("home.btn_tour")}
            </button>
            {/* Button -> 1 vs 1 Mode */}
            <button className="w-[95%] border-1 border-[#F5CFED]/30 bg-[#BF91B2]/50 backdrop-blur-sm rounded-2xl hover-increase hover:ml-1"
              onClick={() => setGameM("Match")}>{t("home.btn_1vs1")}
            </button>
          </div>
          {/* Button -> Tutorial modal */}
          <button onClick={TutorOn} className="absolute top-0 right-0 w-9 md:w-12 aspect-square rounded-full border-2 border-[#AC9ABE] hover-increase hover:rotate-[15deg] transition-transform duration-300">
            <img className="w-full h-full object-cover hover-increase" src="/pic/icons/how.png" />
          </button>
        </>
      }
      </div>
    </>
  );
}