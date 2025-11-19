import React from "react";
import { useLang } from "../../_hooks/language";
import { ModeModal } from "./ModeModal";
import { LocalModal } from "./LocalModal";
import type { PlayerWithProfileData } from "../../../../backend/share/type/Player";

export type GameModalMode = "Tour" | "Match" | "TourL" | "MatchL" | "";

const transitions = {
  "Tour": "",
  "Match": "",
  "TourL": "Tour",
  "MatchL": "Match",
  "": ""
};

function MatchMode({ setGameM, GameM, data }: {
  setGameM: React.Dispatch<React.SetStateAction<GameModalMode>>,
  GameM: GameModalMode,
  data?: PlayerWithProfileData[],
}) {
  const handleTransition = () => {
    setGameM(transitions[GameM] as GameModalMode);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={handleTransition}>
    <div className="absolute inset-0 backdrop-blur-xs" />
      <div className="relative top-0 w-[55%] md:w-[40%] h-[65%] md:h-[50%] flex p-3 gap-0.5 justify-center items-center" onClick={(e) => e.stopPropagation()}>
        <div className="absolute inset-0 bg-[#F5CFED]/40 border border-[#b69bb0]/60 rounded-4xl" />
          {GameM === "Tour" && <ModeModal mode="Tour" setGameM={() => setGameM("TourL")} /> }
          {GameM === "TourL" && <LocalModal mode="Tour" data={data} /> }
          {GameM === "Match" && <ModeModal mode="Match" setGameM={() => setGameM("MatchL")} /> }
          {GameM === "MatchL" && <LocalModal mode="Match" data={data} /> }
      </div>
    </div>
  );
}

export function GameMode({ TutorOn, setGameM, gameM, data }: {
  TutorOn: () => void,
  setGameM: React.Dispatch<React.SetStateAction<GameModalMode>>,
  gameM: GameModalMode,
  data?: PlayerWithProfileData[],
}) {
  const { t } = useLang();

	return (
    <>
      <div className="relative top-1/4 w-full h-[60%] md:h-1/2 rounded-4xl bg-[#F5CFED]/40">
      { gameM !== "" ?
        <div className="p-7 md:p-10 w-full h-full">
          <MatchMode setGameM={setGameM} GameM={gameM} data={data} />
        </div>
      :
        <>
          <div className="grid grid-cols-2 justify-items-center p-7 md:p-10 w-full h-full">
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