import { useNavigate, useOutletContext } from "react-router-dom"
import { withTranslation, type TranslationProps } from "../../_hooks/language"
import type { User } from "../../../../backend/share/type/user";
import React from "react";
import { apiFetchPrivate } from "../../utils";

function ProfileSB({ t, toasterPluz, isMe, id }: { isMe: boolean, id: number } & TranslationProps ) {
  const navigate = useNavigate();
  const { user } = useOutletContext<{ user: User | null }>();
  const [profile, setProfile] = React.useState<{ id: number; name: string; avatar: string } | null>(null);

  React.useEffect(() => {
    if (!isMe)
    {
        (async () => {
          try {
            const res = await apiFetchPrivate(`basic_profile/${id}`, { method: "GET" });
            setProfile(res); 
          } catch (err: any) {
            toasterPluz(err);
          }
        })();
    }

  }, []);

  const avatarURL = isMe ? `${import.meta.env.VITE_API_AVATAR}${user?.profile.avatar_path}?t=${Date.now()}` : `${import.meta.env.VITE_API_AVATAR}${profile?.avatar}`;
  const { win_games = 0, tournament_wins = 0, total_game = 0, win_rate = 0.0 } = user?.profile || {};
  const displayDash = (num: number) => (num === 0 ? "-" : num);
  const high = typeof win_rate === "number" && win_rate >= 51.0;

	return (
    <>
    {/* Sidebar: User Stats & Back Button */}
    <div className="h-full flex flex-col md:justify-between items-center">

      <div className="hidden md:block"/>
      <div className="hidden md:block"/>

      {!isMe &&
        <>
        <h2 className="text-lg">{`< Viewing >`}</h2>
        </>
      }

      <div className="flex flex-col mt-2">
        {/* Avatar */}
        <button className="aspect-square h-12 md:h-35 rounded-full overflow-hidden border-1 md:border-3 border-silver disable" tabIndex={-1}>
          <img className="w-full h-full object-cover" src={avatarURL} />
        </button>
        {/* Username */}
        <span className={`text-center text-base md:text-2xl ${isMe ? "text-[#a2afcd]" : "text-[#84cae6]"}`}>{isMe ? user?.acc.username : profile?.name}</span>
      </div>

      <div className="hidden md:block"/>

      { isMe &&
      <>
        {/* User's Game Statues */}
        <div className="mt-2 flex flex-col items-center text-xs md:text-base">
          <div className="hidden md:flex md:flex-col md:items-center">
            {/* Won */}
            <span className="hidden md:inline">{t("shared.game_stat.won")}</span>
            <span className="hidden md:inline
              leading-[150%] text-golden
              [text-shadow:1px_1px_2px_rgba(0,0,0,0.6),-1px_-1px_2px_rgba(255,255,255,0.7)]"
            >{displayDash(win_games)}</span>

            {/* Tournament won */}
            <span>{t("shared.game_stat.tournament")}</span>
            <span className="
              leading-[150%] text-golden
              [text-shadow:1px_1px_2px_rgba(0,0,0,0.6),-1px_-1px_2px_rgba(255,255,255,0.7)]"
            >{displayDash(tournament_wins)}</span>
          </div>

          {/* Total match */}
          <span>{t("shared.game_stat.total_match")}</span>
          <span className="leading-[150%] text-golden
            [text-shadow:1px_1px_2px_rgba(0,0,0,0.6),-1px_-1px_2px_rgba(255,255,255,0.7)]"
          >{displayDash(total_game)}</span>
              
          {/* Win Rate */}
          <span>{t("shared.game_stat.win_rate")}</span>
          <span className={`
            leading-[150%] ${high ? "text-golden" : "text-[#876E4B]"}
            ${high && "[text-shadow:1px_1px_2px_rgba(80,80,80,0.6),-1px_-1px_2px_rgba(255,255,255,0.9)]"} `}>
            {!win_rate ? "-" : `${win_rate} %`}
          </span>
        </div>

      <div className="hidden md:block"/>
      </>
      }

      {/* Back Button */}
      <button className="mt-3 w-11 md:w-15 aspect-square border-2 border-silver rounded-md overflow-hidden hover-increase" onClick={() => isMe ? navigate("/") : navigate("/friends")}>
        <img src="/pic/icons/back_btn.png" className="drop-shadow-lg w-full h-full object-cover"/>  
      </button>

      {!isMe &&
      <>
        <button className="mt-3 w-11 md:w-15 aspect-square border-2 border-silver rounded-md overflow-hidden hover-increase" onClick={() => navigate("/match_history")}>
          <img src="/pic/icons/how.png" className="drop-shadow-lg w-full h-full object-cover"/>  
        </button>
        <button className="mt-3 w-11 md:w-15 aspect-square border-2 border-silver rounded-md overflow-hidden hover-increase" onClick={() => navigate("/")}>
          <img src="/pic/icons/home_btn.png" className="drop-shadow-lg w-full h-full object-cover"/>  
        </button>
      </>
      }

      <div className="hidden md:block"/>
      <div className="hidden md:block"/>

    </div>
    </>
	);
}

export const ProfileSideBar = withTranslation(ProfileSB);