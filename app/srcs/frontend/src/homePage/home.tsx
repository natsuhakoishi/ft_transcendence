import React from "react";
import toast from "react-hot-toast"
import { useNavigate, useOutletContext } from "react-router-dom";
import { Credit, GameMode, LoadingScreen, Tutorial, type Progress } from "./HomeChildC.tsx"
import { useLang, withTranslation, type Lang, type TranslationProps } from "../_hooks/language.tsx";
import type { User } from "../../../backend/share/type/user.ts";

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

  <div className="absolute min-h-[100lvh] w-[100lvw] inset-0 -z-10 bg-cover bg-center bg-[url('/pic/homeP.jpg')] bg-black/25 bg-blend-overlay overflow-hidden" />
  { loading ? <LoadingScreen progress={progress}/> :
    (
    <div className="relative h-[100lvh] w-[100lvw] grid grid-cols-[1fr_2fr_1fr] overflow-hidden text-lg md:text-2xl">

      {/* Pop Up Modal -> Credits page */}
      {creditM && <Credit onClick={() => setCreditM(false)} />}
      {/* Pop Up Modal -> Tutor page */}
      {tutorM && <Tutorial onClick={() => setTutorM(false)} />}
      {/* Pop Up Modal -> Game Mode Selection PLuZ */}
      {gameM !== "" && <GameMode setGameM={setGameM} GameM={gameM} />}

      {/*Left part*/}
      <div className="relative column-start-1 row-span-3 flex flex-col ml-1">

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

      {/*Center part*/}
      <div className="relative column-start-2 row-span-3 flex flex-col items-center">

        {/* Menu -> Select Game Mode */}
        <div className="relative top-1/4 w-full h-[60%] md:h-1/2 rounded-4xl bg-[#F5CFED]/40">
          {/* Game Mode */}
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
          {/* Modal -> Tutorial */}
          <button onClick={() => setTutorM(true)} className="absolute top-0 right-0 w-9 md:w-12 aspect-square rounded-full border-2 border-[#AC9ABE] hover-increase hover:rotate-[15deg] transition-transform duration-300">
            <img className="w-full h-full object-cover hover-increase" src="/pic/icons/how.png" />
          </button>
        </div>

        {/* Display -> trigger Credits modal */}
        <span className="absolute bottom-2 cursor-pointer" onClick={() => setCreditM(true)} >{t("home.btn_credit")}</span>

      </div>

      {/*Right part*/}
      <div className="relative column-start-3 row-span-3 flex flex-col items-end mr-0.5 md:mr-3 gap-2">

        {/* Display -> Game Version */}
        <span className="font-semibold">{t("home.text_version")} {import.meta.env.VITE_VERSION}</span>
        {/* Dropdown -> Language Selector */}
        <LanguageBar />
        {/* Button -> Match History page */}
        <button className="absolute bottom-2 rounded-2xl p-2 border-1 border-gray-200/30 bg-gray-300/20 whitespace-nowrap font-bold hover hover:scale-120 hover:mr-1 backdrop-blur-lg" onClick={() => navigate("/match_history")}>{t("home.btn_history")}</button>

      </div>

    </div>
    )
  }

  </>
);
}

export const Home = withTranslation(HomeP);