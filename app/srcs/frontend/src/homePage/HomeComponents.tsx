import React from "react";
import { useLang, type Lang } from "../_hooks/language";

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

// Language Dropdown

type LanguageBarProps = {
  bgColor?: string;
  optionColor?: string;
};

export function LanguageBar({ bgColor = "bg-gray-800/80", optionColor = "bg-[#1E1622]" }: LanguageBarProps) {
  const { lang, setLang } = useLang();

  return (
    <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}
      className={`appearance-none border-2 rounded p-1 text-lg ${bgColor} hover`}
    >
      <option value="en" className={optionColor}>English</option>
      <option value="zh" className={optionColor}>繁體中文</option>
      <option value="jp" className={optionColor}>日語</option>
    </select>
  );
}

// Credit Modal

function CreditMember({ link, github, intra, roles }: { link: string, github: string, intra: string, roles: string}) {
  return (
    <div className="flex w-full gap-2 items-center">
      <img className="w-16 md:w-20 aspect-square rounded-sm border-2 p-1.5" src={link} />
      <div className="font-semibold ">
        <span className="text-[18px] md:text-[20px] font-inter font-bold leading-[150%] text-silver
          [text-shadow:1px_1px_2px_rgba(80,80,80,0.8),-1px_-1px_2px_rgba(200,200,200,0.9)]">
          {github}
        </span>
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
    <div className="p-0.5 fixed inset-0 z-50 flex flex-col items-center justify-center gap-1 bg-gray-600/40" onClick={onClick}>

      <div className="p-1 h-[99%] w-[80%] md:w-[65%] md:h-[68%] relative flex flex-col justify-center md:gap-3 bg-gray-300/60 backdrop-blur-lg border-1 rounded-4xl" onClick={(e) => e.stopPropagation()}>
        <h1 className="text-xl md:text-2xl text-center">{t("home.btn_credit")}</h1>
        <div className="flex flex-col gap-1 md:gap-3 items-start mx-5 md:mx-10">
          <CreditMember link="/pic/e.png" github="Natsuha" intra="yyean-wa" roles={t("home.role_en")} />
          <CreditMember link="/pic/yb.png" github="Yabi" intra="yyan-bin" roles={t("home.role_yb")} />
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
    <div className="fixed h-screen w-screen z-50 flex md:flex-col items-center justify-center gap-3" onClick={onClick}>
    <div className="absolute inset-0 bg-gray-600/40 backdrop-blur-xs"/>

      <div className="relative w-[70%] md:w-[60%] max-h-[95vh] flex flex-col items-center rounded-2xl">
        <h1 className="w-fit text-3xl font-bold text-shadow-lg" onClick={(e) => e.stopPropagation()}>
          {t("home.tutor")}
        </h1>
        <div className="relative w-full h-[200px] md:h-[400px] mt-2" onClick={(e) => e.stopPropagation()}>
          <img className="w-full h-full object-cover rounded-2xl" src={`${toggle === "first" ? "/pic/tutorial.png" : "/pic/tutorial_4.png"}`} />
        </div>
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <button className="absolute md:relative w-11 md:w-15 aspect-square border-2 border-silver rounded-md overflow-hidden hover-increase" onClick={() => setToggle(toggle === "first" ? "second" : "first")}>
          <img src={`${toggle === "first" ? "/pic/icons/next_btn.png" : "/pic/icons/back_btn.png" }`} className="drop-shadow-lg w-full h-full object-cover"/>  
        </button>
      </div>

    </div>
  );
}

