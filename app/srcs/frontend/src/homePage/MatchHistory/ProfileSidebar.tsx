import { useNavigate, useOutletContext } from "react-router-dom"
import { withTranslation, type TranslationProps } from "../../_hooks/language"
import type { User } from "../../../../backend/share/type/user";

function ProfileSB({ t }: TranslationProps) {
  const navigate = useNavigate();
  const { user } = useOutletContext<{ user: User | null }>();
  const avatarURL = `${import.meta.env.VITE_API_AVATAR}${user?.profile.avatar_path}?t=${Date.now()}`;
  console.log(user);
  const { win_games = 0, tournament_wins = 0, total_game = 0, win_rate = 0.0 } = user?.profile || {};
  const displayDash = (num: number) => (num === 0 ? "-" : num);

	return (
    <>
    {/* Sidebar: User Stats & Back Button */}
    <div className="flex flex-col h-screen justify-between items-center">

      <div />
      <div />

      <div className="flex flex-col">
        {/* Avatar */}
        <button className="flex-shrink-0 aspect-square h-35 rounded-full overflow-clip border-3 border-silver disable" tabIndex={-1}>
          <img className="w-full h-full object-cover" src={avatarURL} />
        </button>
        {/* Username */}
        <span className="text-center text-2xl text-[#9DD6AD]">{user?.acc.username}</span>
      </div>

      <div />

      <div className="flex flex-col items-center">
      {/* Won */}
      <span>{t("shared.game_stat.won")}</span>
      <span className="
        font-inter font-bold leading-[150%] text-golden
        [text-shadow:1px_1px_2px_rgba(0,0,0,0.6),-1px_-1px_2px_rgba(255,255,255,0.7)]"
      >{displayDash(win_games)}</span>

      {/* Tournament won */}
      <span className="ml-3 row-span-2">{t("shared.game_stat.tournament")}</span>
      <span className="
        font-inter font-bold leading-[150%] text-golden
        [text-shadow:1px_1px_2px_rgba(0,0,0,0.6),-1px_-1px_2px_rgba(255,255,255,0.7)]"
      >{displayDash(tournament_wins)}</span>
      
      {/* Total match */}
      <span className="font-bold">{t("shared.game_stat.total_match")}</span>
      <span className="font-inter font-bold leading-[150%] text-golden
        [text-shadow:1px_1px_2px_rgba(0,0,0,0.6),-1px_-1px_2px_rgba(255,255,255,0.7)]"
      >{displayDash(total_game)}</span>
          
      {/* Win Rate */}
      <span className="font-bold">{t("shared.game_stat.win_rate")}</span>
      <span className={`
        font-inter font-bold leading-[150%] ${typeof win_rate === "number" && win_rate >= 51.0 ? "text-golden" : "text-gray-600"}
        [text-shadow:1px_1px_2px_rgba(0,0,0,0.6),-1px_-1px_2px_rgba(255,255,255,0.7)]`}
      >{!win_rate ? "-" : `${win_rate}%`}</span>
    </div>

    <div /> 

    {/* Back Button */}
    <button className="w-15 aspect-square border-2 border-silver rounded-md overflow-hidden hover:scale-90 transition-transform" onClick={() => navigate("/")}>
      <img src="/pic/icons/back_btn.png" className="drop-shadow-lg w-full h-full object-cover"/>  
    </button>

    <div />
    <div />

    </div>
    </>
	);
}

export const ProfileSideBar = withTranslation(ProfileSB);