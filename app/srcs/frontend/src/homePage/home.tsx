import React from "react";
import toast from "react-hot-toast"
import { useNavigate, Outlet, useOutletContext } from "react-router-dom";
import { loadData, LoadingScreen, type Progress } from "./loadData.tsx"
import { useLang, withTranslation, type Lang, type TranslationProps } from "../_hooks/language.tsx";
import type { User } from "../../../backend/share/type/user.ts";
import { Matching } from "../gamePage/matching.tsx";

export function LanguageBar() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex items-center justify-between p-1">
      <h1 className="text-lg font-bold"></h1>
      <select value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        className="border-2 rounded bg-gray-800"
      >
        <option value="en" className="bg-blue-950">English</option>
        <option value="zh" className="bg-blue-950">繁體中文</option>
        <option value="jp" className="bg-blue-950">日語</option>
      </select>
    </div>
  );
}

function fetchD({ t, toasterPluz }: TranslationProps) { 
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [progress, setProgress] = React.useState<Progress>({ step: `${t("loading.step_start")}`, completed: null, total: 2 });

  React.useEffect(() => {
    console.log("Fetching data...");
    setTimeout(() => {
      loadData({ setLoading, setProgress, setUser }, { t, toasterPluz });
    }, 500);
  }, []);

  const refetchData = React.useCallback(() => {
    console.log("Refetch triggered");
    setTimeout(() => {
      loadData({ setLoading, setProgress, setUser }, { t, toasterPluz });
    }, 500);
  }, []);

  return (
    <Outlet context={{ user, loading, progress, refetchData}} />
  );
}

export const FetchData = withTranslation(fetchD);

export type SharedData = {
  user: User | null;
  loading: boolean;
  progress: Progress;
};

export function HomeP({ t, lang }: { t: (key: string) => string; lang?: string }) {
  const navigate = useNavigate();
  const { user, loading, progress } = useOutletContext<SharedData>();
  const avatarURL = `${import.meta.env.VITE_API_AVATAR}/${user?.profile.avatar_path}?t=${Date.now()}`;
  const [match, setMatch] = React.useState<boolean>(false);
  const [ AI, setAI ] = React.useState(false);

  React.useEffect(() => {
    document.title = t("home.title");
  }, [t, lang]);

  React.useEffect(() => {
    if (user && !loading)
      toast.success(`${t("home.msg_greeting")}${user.acc.username}.`);
  }, [user, loading]);

  return (
    <>
    {loading ? <LoadingScreen progress={progress}/> : 
      (match === true ? <Matching again={false} setMatch={setMatch} AI={AI} /> :
        (<div className="h-screen w-screen max-w-screen grid grid-cols-[1fr_2fr_1fr] bg-cover bg-center bg-black/23 bg-[url('/pic/homeP.jpg')] bg-blend-overlay text-xl">

          {/*Left part*/}
          <div className="column-start-1 row-span-3 flex flex-col justify-between">
            <div className="flex gap-2 mx-1 my-1 p-1 bg-gray-300/20 rounded-2xl font-bold">
              <button className="w-12 h-12 rounded-full overflow-clip border-2 border-[#AC9ABE]/50 flex items-center justify-center hover:scale-90 transition-transform"
                onClick={() => navigate("/profile")}>
                <img className="w-full h-full object-cover" src={avatarURL} />
              </button>
              <span className="my-1 font-mono text-blue-300 whitespace-nowrap overflow-x-auto">{user?.acc.username}</span>
            </div>
            <button className="absolute p-1 bottom-2 left-4 bg-gray-300/50 hover:scale-120 transition-transform font-bold" onClick={() => navigate("/friends")}>{t("home.btn_friend")}</button>
          </div>

          {/*Center part*/}
          <div className="column-start-2 row-span-3 flex flex-col items-center">
            <div className="flex-1" />
            <div className="bg-[#F5CFED]/55 w-full h-1/2 rounded-4xl">
              <div className="grid grid-cols-2 gap-2 p-10 w-full h-full place-items-center x">
                <button className="row-span-2 w-full h-full bg-[#925192]/80 rounded-2xl hover-increase"
                 onClick={() => navigate(import.meta.env.VITE_GAME_PATH_TOURNAMENT_MATCHING)}
                >{t("home.btn_tour")}</button>

                <button className="bg-[#BF91B2]/85 h-full w-[90%] rounded-2xl"
                 onClick={() => { setMatch(true); setAI(false); }}>{t("home.btn_1vs1")}</button>

                <button className="bg-[#BF91B2]/85 h-full w-[90%] rounded-2xl"
                 onClick={() => { setMatch(true); setAI(true); }}>{t("home.btn_AI")}</button>
              </div>
            </div>
            <div className="flex-1" />
            <span className="mb-3">{t("home.btn_credit")}</span>
          </div>

          {/*Right part*/}
          <div className="column-start-3 row-span-3 flex flex-col items-end mr-3">
            <span className="p-2 font-semibold">{t("home.text_version")} {import.meta.env.VITE_VERSION}</span>
            <LanguageBar />
            <button className="absolute bottom-2 right-4 p-1 bg-gray-300/50 hover:scale-120 transition-transform font-bold" onClick={() => navigate("/match_history")}>{t("home.btn_history")}</button>
          </div>

        </div>
      ))
    }
    </>
  );
}

export const Home = withTranslation(HomeP);
