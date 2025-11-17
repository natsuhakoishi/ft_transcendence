import React from "react";
import toast from "react-hot-toast"
import { useNavigate, useOutletContext } from "react-router-dom";
import { Credit, LoadingScreen, Tutorial, type Progress } from "./HomeChildC.tsx"
import { useLang, withTranslation, type Lang, type TranslationProps } from "../_hooks/language.tsx";
import type { User } from "../../../backend/share/type/user.ts";
import { GameMode } from "./GameModeSection.tsx";

type LanguageBarProps = {
  bgColor?: string;
  optionColor?: string;
};

export function LanguageBar({ bgColor = "bg-gray-800/80", optionColor = "bg-[#1E1622]" }: LanguageBarProps) {
  const { lang, setLang } = useLang();

  return (
    <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}
      className={`appearance-none border-2 rounded p-1 text-lg ${bgColor} hover`}
      style={{ backgroundColor: bgColor.startsWith("#") ? bgColor : undefined }}
    >
      <option value="en" className={optionColor}>English</option>
      <option value="zh" className={optionColor}>繁體中文</option>
      <option value="jp" className={optionColor}>日語</option>
    </select>
  );
}

export type SharedData = {
  user: User | null;
  loading: boolean;
  progress: Progress;
};

export function HomeP({ t, lang }: TranslationProps) { 
  const navigate = useNavigate();
  const { user, loading, progress } = useOutletContext<SharedData>();
  const avatarURL = `${import.meta.env.VITE_API_AVATAR}${user?.profile.avatar_path}?t=${Date.now()}`;
  const [ creditM, setCreditM ] = React.useState<boolean>(false);
  const [ tutorM, setTutorM ] = React.useState<boolean>(false);
  const [ gameM, setGameM ] = React.useState<"Tour" | "Match" | "TourL" | "MatchL" | "">("");

  React.useEffect(() => {
    document.title = t("home.title");
  }, [t, lang]);

  React.useEffect(() => {
    if (user && !loading)
      toast.success(`${t("home.msg_greeting")}${user.acc.username}.`);
  }, [user, loading]);

return (
  <>

  <div className="h-[100lvh] w-[100lvw] flex justify-center items-center overflow-hidden">
    <div className="fixed inset-0 -z-10 bg-cover bg-center bg-[url('/pic/homeP.jpg')] bg-black/25 bg-blend-overlay" />
    { gameM && (<div className="fixed inset-0 z-20 bg-cover bg-center bg-[url('/pic/homeP.jpg')] bg-black/25 bg-blend-overlay" /> )}
    { loading ? <LoadingScreen progress={progress}/> :
      <>
      <div className="relative h-full w-full grid grid-cols-[1fr_2fr_1fr] grid-rows-1 overflow-hidden text-lg md:text-2xl">
        {creditM && <Credit onClick={() => setCreditM(false)} />}
        {tutorM && <Tutorial onClick={() => setTutorM(false)} />}

        <div className="flex flex-col ml-1">
          {/* Top Left: avatar & username */}
          <div className="absolute flex gap-1 mx-1 my-2 p-1 bg-gray-300/20 rounded-2xl font-bold w-fit backdrop-blur-lg">
            {/* Avatar -> Profile page */}
            <button className="w-12 h-12 rounded-full overflow-clip border-2 border-[#AC9ABE]/50 flex-shrink items-center justify-center hover-increase"
              onClick={() => navigate("/profile")}> 
              <img className="w-full h-full object-cover" src={avatarURL} />
            </button>
            {/* Display -> Username */}
            <span className="font-mono text-blue-300 pr-2">{user?.acc.username}</span>
          </div>
          {/* Button -> Friend page */}
          <button className="absolute bottom-2 p-2 rounded-2xl border-1 border-gray-200/30 font-bold hover hover:scale-120 hover:ml-1 backdrop-blur-lg" onClick={() => navigate("/friends")}>{t("home.btn_friend")}</button>
        </div>

        <div className="flex flex-col items-center">
          {/* Section -> pick Game Mode & Match Mode */}
          <GameMode TutorOn={() => setTutorM(true)}  setGameM={setGameM} gameM={gameM}/>
          {/* Text -> toggle Credits modal */}
          <span className="absolute bottom-2 cursor-pointer" onClick={() => setCreditM(true)} >{t("home.btn_credit")}</span>
        </div>

        <div className="flex flex-col items-end mr-0.5 md:mr-3 gap-2">
          {/* Text -> Game Version */}
          <span className="font-semibold">{t("home.text_version")} {import.meta.env.VITE_VERSION}</span>
          {/* Dropdown -> Language Selector */}
          <LanguageBar />
          {/* Button -> Match History page */}
          <button className="absolute bottom-2 rounded-2xl p-2 border-1 border-gray-200/30 bg-gray-300/20 whitespace-nowrap font-bold hover hover:scale-120 hover:mr-1 backdrop-blur-lg" onClick={() => navigate("/match_history")}>{t("home.btn_history")}</button>
        </div>
      </div>
      </>
    }
  </div>

  </>
  );
}

export const Home = withTranslation(HomeP);