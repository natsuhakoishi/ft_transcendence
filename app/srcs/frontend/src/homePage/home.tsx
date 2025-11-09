import React from "react";
import toast from "react-hot-toast"
import { useNavigate, useOutletContext } from "react-router-dom";
import { Credit, LoadingScreen, type Progress } from "./HomeChildC.tsx"
import { useLang, withTranslation, type Lang, type TranslationProps } from "../_hooks/language.tsx";
import type { User } from "../../../backend/share/type/user.ts";
import { Matching } from "../gamePage/matching.tsx";

type LanguageBarProps = {
  bgColor?: string;
  optionColor?: string;
};

export function LanguageBar({ bgColor = "bg-gray-800/80", optionColor = "bg-[#1E1622]" }: LanguageBarProps) {
  const { lang, setLang } = useLang();

  return (
    <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}
      className={`border-2 rounded p-1 text-lg ${bgColor} hover`}
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
  const [match, setMatch] = React.useState<boolean>(false);
  const [ AI, setAI ] = React.useState<boolean>(false);
  const [ creditM, setCreditM ] = React.useState<boolean>(false);

  React.useEffect(() => {
    document.title = t("home.title");
  }, [t, lang]);

  React.useEffect(() => {
    if (user && !loading)
      toast.success(`${t("home.msg_greeting")}${user.acc.username}.`);
  }, [user, loading]);

return (
  <>
  {/* Background Layer */}
  <div className="absolute min-h-[100lvh] w-[100lvw] inset-0 -z-10 bg-cover bg-center bg-[url('/pic/homeP.jpg')] bg-black/25 bg-blend-overlay overflow-hidden" />
  {/* Page Content - Conditional Render [ Loading / Matching / Home Page ] */}
  {
    loading ? <LoadingScreen progress={progress}/> :
      match === true ? <Matching again={false} setMatch={setMatch} AI={AI} /> :
        (<div className="h-[100lvh] w-[100lvw] grid grid-cols-[1fr_2fr_1fr] overflow-hidden text-xl">

          {/* Pop Up Modal -> Credits page */}
          {creditM && <Credit onClick={setCreditM} />}

          {/*Left part*/}
          <div className="column-start-1 row-span-3 flex flex-col justify-between">
            {/* Top Left: avatar & username */}
            <div className="flex gap-2 mx-1 my-1 p-1 bg-gray-300/20 rounded-2xl font-bold w-[80%]">
              {/* Avatar -> Profile page */}
              <button className="w-12 h-12 rounded-full overflow-clip border-2 border-[#AC9ABE]/50 flex items-center justify-center hover-increase"
                onClick={() => navigate("/profile")}> 
                <img className="w-full h-full object-cover" src={avatarURL} />
              </button>
              {/* Display -> Username */}
              <span className="my-1 font-mono text-blue-300">{user?.acc.username}</span>
            </div>
            {/* Button -> Friend page */}
            <button className="absolute p-2 bottom-2 left-4 rounded-2xl bg-gray-300/50 font-bold hover hover:scale-120" onClick={() => navigate("/friends")}>{t("home.btn_friend")}</button>
          </div>

          {/*Center part*/}
          <div className="column-start-2 row-span-3 flex flex-col items-center">

            <div className="flex-1" />

            {/* Menu -> Select Game Mode */}
            <div className="bg-[#F5CFED]/55 w-full h-1/2 rounded-4xl sm:mb-10">
              <div className="grid grid-cols-2 gap-2 p-10 w-full h-full place-items-center x">
                {/* Button -> Tournament Mode */}
                <button className="row-span-2 w-full h-full bg-[#925192]/80 rounded-2xl hover-increase"
                  onClick={() => navigate(import.meta.env.VITE_GAME_PATH_TOURNAMENT_MATCHING)}
                >{t("home.btn_tour")}</button>

                {/* Button -> 1 vs 1 Mode */}
                <button className="bg-[#BF91B2]/85 h-full w-[90%] rounded-2xl hover-increase"
                  onClick={() => { setMatch(true); setAI(false); }}>{t("home.btn_1vs1")}</button>

                {/* Button -> AI Mode */}
                <button className="bg-[#BF91B2]/85 h-full w-[90%] rounded-2xl hover-increase"
                  onClick={() => { setMatch(true); setAI(true); }}>{t("home.btn_AI")}</button>
              
              </div>
            </div>

            <div className="flex-1" />

            {/* Display -> trigger Credits modal */}
            <span className="absolute bottom-2 cursor-pointer" onClick={() => setCreditM(true)} >{t("home.btn_credit")}</span>
          </div>

          {/*Right part*/}
          <div className="column-start-3 row-span-3 flex flex-col items-end mr-3">
            {/* Display -> Game Version */}
            <span className="p-2 font-semibold">{t("home.text_version")} {import.meta.env.VITE_VERSION}</span>
            {/* Dropdown -> Language Selector */}
            <LanguageBar />
            {/* Button -> Match History page */}
            <button className="absolute bottom-2 right-4 rounded-2xl p-2 bg-gray-300/50 font-bold hover hover:scale-120" onClick={() => navigate("/match_history")}>{t("home.btn_history")}</button>
          </div>
        </div>)
  }
  </>
);
}

export const Home = withTranslation(HomeP);