import React from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../../_hooks/language";
import { Matching } from "../../gamePage/matching";

function ModeButton({ mode, text, onClick }: {
	mode: "Tour" | "Match",
	text: string, 
	onClick: () => void,
}) {
  const bgColor = mode === "Tour" ? "bg-[#925192]/50": "bg-[#BF91B2]/50";
  const borderColor = mode === "Tour" ? "border-[#7F477F]/50" : "border-[#F5CFED]/30";

	return (
		<button onClick={onClick}
      className={`py-5 w-1/3 mx-0.5 border-1 ${borderColor} rounded-2xl ${bgColor} backdrop-blur-lg
      hover-increase hover:mx-2 hover:brightness-110 hover:backdrop-blur-none transition-all`}
    >
			{text}
		</button>
	);
}

export function ModeModal({ mode, setGameM }: { mode: "Tour" | "Match", setGameM: () => void }) {
  const navigate = useNavigate();
  const { t } = useLang();

  return (
    <>

    { mode === "Tour" ?
      <>
        {/* Button -> Remote Tournament */}
        <ModeButton mode="Tour" text={t("home.btn_online")}
          onClick={() => navigate(import.meta.env.VITE_GAME_PATH_TOURNAMENT_MATCHING)}
        />
        {/* Button -> Local Tournament */}
        <ModeButton mode="Tour" onClick={setGameM} text={t("home.btn_local")} />
      </>
        :
      <>
        {/* Button -> Online Mode */}
        <ModeButton mode="Match" text={t("home.btn_online")}
          onClick={() => navigate(import.meta.env.VITE_GAME_PATH_MATCHING, { state: { AI: false, mode: "normal"} })}
        />
        {/* Button -> AI Mode */}
        <ModeButton mode="Match" text={t("home.btn_AI")}
          onClick={() => navigate(import.meta.env.VITE_GAME_PATH_MATCHING, { state: { AI: true, mode: "AI" } })}
        />
        {/* Button -> Local Mode */}
        <ModeButton mode="Match" onClick={setGameM} text={t("home.btn_local")} />
      </>
    }

    </>
  );
};