import { useLang } from "../_hooks/language";

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

export function Credit({ onClick }: { onClick: React.Dispatch<React.SetStateAction<boolean>> }) {
  const { t } = useLang();

  return (
    //{/* Background Layer -> blur effect */}
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-1 bg-gray-300/20 backdrop-blur-sm" onClick={() => onClick(false)}>

    {/* Modal -> Credit */}
    <div className="w-[60%] h-[68%] relative flex flex-col justify-center gap-3 bg-gray-300/60 backdrop-blur-2xl border-1 rounded-4xl" onClick={(e) => e.stopPropagation()}>
      {/* Title */}
      <h1 className="text-2xl text-center">{t("home.btn_credit")}</h1>
      {/* Credit list */}
      <div className="flex flex-col gap-3 items-start mx-10">

        {/* First */}
        <div className="flex w-full gap-2 items-center">
          <img className="w-20 aspect-square rounded-sm border-2 p-1.5" src="/pic/e.png" />
          <div className="font-semibold ">
            <span className="text-[20px] font-inter font-bold leading-[150%] text-silver
              [text-shadow:1px_1px_2px_rgba(80,80,80,0.8),-1px_-1px_2px_rgba(200,200,200,0.9)]">natsuhakoishi</span>
            <p className="text-base italic text-[#848A98] mb-3">yyean-wa</p>
          </div>
          <div className="flex-1" />
          <div>{t("home.role_en")}</div>
          <div className="flex-1" />
        </div>

        {/* Second */}
        <div className="flex w-full gap-2 items-center">
          <img className="w-20 aspect-square rounded-sm border-2" src="/pic/yb.png" />
          <div className="flex flex-col font-semibold">
            <span className="text-xl font-inter font-bold leading-[150%] text-silver
              [text-shadow:1px_1px_2px_rgba(80,80,80,0.6),-1px_-1px_2px_rgba(200,200,200,0.7)]">Yabi924</span>
            <span className="text-base italic text-[#848A98]">yyan-bin</span> 
          </div>
          <div className="flex-1" />
          <div>{t("home.role_yb")}</div>
          <div className="flex-1" />
        </div>

        {/* Third */}
        <div className="flex w-full gap-2 items-center">
          <img className="w-20 aspect-square rounded-sm border-2" src="/pic/zw.png" />
          <div className="font-semibold">
            <span className="text-xl font-inter font-bold leading-[150%] text-silver
              [text-shadow:1px_1px_2px_rgba(80,80,80,0.6),-1px_-1px_2px_rgba(200,200,200,0.7)]">nightZQ</span>
            <p className="text-base italic text-[#848A98]">zgoh</p> 
          </div>
          <div className="flex-1" />
          <div>{t("home.role_zw")}</div>
          <div className="flex-1" />
        </div>

      </div>
        <div className="text-sm text-center">©iDreamSky | React · Tailwind CSS · TS · Fastify · Node.js | Team ft_klbq</div>
    </div>
    </div>
  );
}