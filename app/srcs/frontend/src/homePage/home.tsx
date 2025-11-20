import React from "react";
import toast from "react-hot-toast"
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { Credit, LanguageBar, LoadingScreen, Tutorial, type Progress } from "./HomeComponents.tsx"
import { withTranslation, type TranslationProps } from "../_hooks/language.tsx";
import type { User } from "../../../backend/share/type/user.ts";
import { GameMode, type GameModalMode } from "./GameMode/game_mode.tsx";
import type { PlayerWithProfileData } from "../../../backend/share/type/Player.ts";

export type SharedData = {
  user: User | null;
  loading: boolean;
  progress: Progress;
};

export function HomeP({ t, lang }: TranslationProps) { 
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as { game: GameModalMode, data: PlayerWithProfileData[] };
  const [ data , setData ] =  React.useState<PlayerWithProfileData[]>(state.data ?? []);
  const { user, loading, progress } = useOutletContext<SharedData>();
  const avatarURL = `${import.meta.env.VITE_API_AVATAR}${user?.profile.avatar_path}?t=${Date.now()}`;
  const [ modal, setModal ] = React.useState<React.ReactNode>("");
  const [ gameM, setGameM ] = state.game ? React.useState<GameModalMode>(state.game) : React.useState<GameModalMode>("");

  React.useEffect(() => {
    document.title = t("home.title");
  }, [t, lang]);

  React.useEffect(() => {
    if (user && !loading)
      toast.success(`${t("home.msg_greeting")}${user.acc.username}.`);
  }, [user, loading]);

  React.useEffect(() => {
    if (gameM === "Match" || gameM === "Tour")
      setData([]);
  }, [gameM]);

return (
  <>
  <div className="h-[100lvh] w-[100lvw] flex justify-center items-center overflow-hidden">
    <div className="fixed inset-0 -z-10 bg-cover bg-center bg-[url('/pic/homeP.jpg')] bg-black/25 bg-blend-overlay" />
    {/* the layout to cover home page content when selecting match mode */}
    { gameM && (<div className="fixed inset-0 z-20 bg-cover bg-center bg-[url('/pic/homeP.jpg')] bg-black/25 bg-blend-overlay" /> )}

    { loading ? <LoadingScreen progress={progress}/> :
      <>
      <div className="relative h-full w-full grid grid-cols-[1fr_2fr_1fr] grid-rows-1 overflow-hidden text-lg md:text-2xl">

        {modal}

        <div className="flex flex-col ml-1">
          <div className="absolute flex gap-1 mx-1 my-2 p-1 bg-gray-300/20 rounded-2xl font-bold w-fit backdrop-blur-lg">
            {/* Avatar(Button) -> Profile page */}
            <button className="w-12 h-12 rounded-full overflow-clip border-2 border-[#AC9ABE]/50 flex-shrink items-center justify-center hover-increase"
              onClick={() => navigate("/profile")}> 
              <img className="w-full h-full object-cover" src={avatarURL} />
            </button>
            {/* Text -> Username */}
            <span className="font-mono text-blue-300 pr-2">{user?.acc.username}</span>
          </div>
          {/* Button -> Friend page */}
          <button className="absolute bottom-2 p-2 rounded-2xl border-1 border-gray-200/30 font-bold hover hover:scale-120 hover:ml-1 backdrop-blur-lg" onClick={() => navigate("/friends")}>{t("home.btn_friend")}</button>
        </div>

        <div className="flex flex-col items-center">
          {/* Section -> pick Game Mode & Match Mode via modal menu*/}
          <GameMode setGameM={setGameM} gameM={gameM} data={data}
            TutorOn={() => setModal(<Tutorial onClick={() => setModal("")} />)}
          />
          {/* Text -> toggle Credits modal */}
          <span className="absolute bottom-2 cursor-pointer" onClick={() => setModal(<Credit onClick={() => setModal("")} />)}>
            {t("home.btn_credit")}
          </span>
        </div>

        {/* Text -> Game Version */}
        <span className="absolute top-1 right-0.5 md:right-3 text-base text-end">{t("home.text_version")} {import.meta.env.VITE_VERSION}</span>
        <div className="absolute top-8 right-0.5 md:right-3">
          {/* Dropdown -> Language Selector */}
          <LanguageBar />
        </div>
        {/* Button -> Match History page */}
        <button className="absolute bottom-2 right-0.5 md:right-3 rounded-2xl p-2 border-1 border-gray-200/30 bg-gray-300/20 whitespace-nowrap font-bold hover hover:scale-120 hover:mr-1 backdrop-blur-lg" onClick={() => navigate("/match_history")}>{t("home.btn_history")}</button>

      </div>
      </>
    }

  </div>
  </>
  );
}

export const Home = withTranslation(HomeP);