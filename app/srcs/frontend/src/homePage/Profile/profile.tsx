import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { apiFetch } from "../../utils.ts";
import type { User } from "../../../../backend/share/type/user";
import { MenuOption } from "./Option.tsx";
import { useLang, withTranslation, type TranslationProps } from "../../_hooks/language.tsx";

const handleLogOut = async ({ navigate, toasterPluz }: { navigate: (path: string) => void; toasterPluz: (msg: string) => void }) => {
  try {
    await apiFetch("logout", { method: "POST", body: JSON.stringify({}) });
    toasterPluz("profile.OK_LogOut");
    navigate("/auth");
  } catch (err: any) {
    toasterPluz(err);
  }
}

function MenuProfile({ user } : { user: User | null } ) {
  const { t } = useLang();
  const avatarURL = `${import.meta.env.VITE_API_AVATAR}${user?.profile?.avatar_path}?t=${Date.now()}`;
  const { win_games = 0, lose_games = 0, tournament_wins = 0, total_game = 0, win_rate = 0.0 } = user?.profile || {};
  const displayDash = (num: number) => (num === 0 ? "-" : num);

  return (
  <div className="flex md:flex-col md:mt-5 w-full items-center md:items-baseline">

    {/* Upper section*/}
    <div className="flex h-[40%] md:mt-3 mx-3 gap-3">

      {/* Avatar, Online Status */}
      <div className="relative h-16 aspect-square">
        <button className="aspect-square h-full rounded-full overflow-clip border-2 border-gray-300 disable" tabIndex={-1}>
          <img className="w-full h-full object-cover" src={avatarURL} />
        </button>
        <span className="absolute bottom-2 right-0 w-3 aspect-square bg-[#43A25A] rounded-full"></span>
      </div>
      {/* Username, ID */}
      <div className="mx-1 font-semibold">
        <span className="text-3xl text-gray-800">{user ? user?.acc.username : t("loading.step_start")}</span>
        <p className="text-md italic text-[#848A98]">ID: {user ? user?.acc.user_id : "-"}</p> 
      </div>

    </div>

    <div className="hidden md:flex-1" />

    {/* Bottom section - Game stats, ex. win, lost, tournament win, win rate */}
    <div className="flex flex-1 flex-col gap-2 mx-10 md:justify-start md:align-middle">
      {/* First row - win count, lost count, tournament win count */}
      <div className="flex gap-3 text-xl">
        {/* Won */}
        <span>{t("shared.game_stat.won")}</span>
        <span className="font-inter font-bold leading-[150%] text-golden
          [text-shadow:1px_1px_2px_rgba(0,0,0,0.6),-1px_-1px_2px_rgba(255,255,255,0.7)]">{displayDash(win_games)}</span>

        {/* Lose */}
        <span>{t("shared.game_stat.lose")}</span>
        <span className="font-inter font-bold leading-[150%] text-silver
          [text-shadow:1px_1px_2px_rgba(80,80,80,0.6),-1px_-1px_2px_rgba(200,200,200,0.7)]">{displayDash(lose_games)}</span>

        {/* Tournament won */}
        <span className="ml-3 row-span-2">{t("shared.game_stat.tournament")}</span>
        <span className="font-inter font-bold leading-[150%] text-golden
          [text-shadow:1px_1px_2px_rgba(0,0,0,0.6),-1px_-1px_2px_rgba(255,255,255,0.7)]">{displayDash(tournament_wins)}</span>
      </div>

      {/* Second row - total match count & win rate */}
      <div className="flex ml-0.5 gap-5 text-xl">
        {/* Total match */}
        <div className="flex gap-2">
          <span className="font-bold">{t("shared.game_stat.total_match")}</span>
          <span className="font-inter font-bold leading-[150%] text-[#E5EBF7]">{displayDash(total_game)}</span>
        </div>
        
        {/* Win Rate */}
        <div className="flex gap-2">
          <span className="font-bold">{t("shared.game_stat.win_rate")}</span>
          <span className={`font-inter font-bold leading-[150%] ${typeof win_rate === "number" && win_rate >= 51.0 ? "text-golden" : "text-gray-400"}
            [text-shadow:1px_1px_2px_rgba(80,80,80,0.6),-1px_-1px_2px_rgba(200,200,200,0.7)]`}>{!win_rate ? "-" : `${win_rate}%`}</span>
        </div>
      </div>

    </div>

    <div className="flex-1" />

  </div>
  );
}

export function ProfileP({ t, toasterPluz }: TranslationProps) { 
  const navigate = useNavigate();
  const [menu, setMenu] = React.useState<"Profile" | "Option">("Profile");
  const { user, refetchData } = useOutletContext<{user: User | null, refetchData: () => void}>();

  React.useEffect(() => {
    document.title = t("profile.title");
  }, []);

	return (
		<>
    {/* Background Layer */}
    <div className="absolute inset-0 -z-10 bg-cover bg-center bg-blend-overlay bg-[linear-gradient(to_bottom,#6FB7FF4d,#daade04d,#A79BFF4d),url('/pic/profileP.jpeg')]" />
    {/* Content */}
    <div className="relative w-[100dvw] h-[100dvh] flex flex-col justify-center gap-3 md:gap-5">

      {/* Menu Buttons: 'Profile' 'Option' 'Log Out' */}
      <div className="flex gap-5 mt-2 ml-5">
        {/* btn Profile */}
        <button className={`default_button hover-increase transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(239,230,106,1)] ${menu === "Profile" ? "text-sky-200 border-sky-200 bg-sky-200/30 shadow-[0_0_20px_rgba(202,255,246,1)]" : "text-[#E5EBF7] border-[#E5EBF7] bg-[#E5EBF7]/30"}`}
          onClick={() => setMenu("Profile")}>{t("profile.btn_profile")}</button>
        {/* btn Option */}
        <button className={`default_button hover-increase transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(239,230,106,1)] ${menu === "Option" ? "text-sky-200 border-sky-200 bg-sky-200/30 shadow-[0_0_20px_rgba(202,255,246,1)]" : "text-[#E5EBF7] border-[#E5EBF7] bg-[#E5EBF7]/30"}`}
          onClick={() => setMenu("Option")}>{t("profile.btn_option")}</button>
        {/* btn Log Out */}
        <button className="text-white border-white bg-[#f199c4]/80 default_button hover-increase transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(239,96,141,1)]" onClick={() => handleLogOut({ navigate, toasterPluz })}>{t("profile.btn_log_out")}</button>
      </div> 

      {/* conditional render betw Profile & Option */}
      <div className="w-screen h-[50%] md:h-[40%] md:h-50% shadow-md shadow-gray-400 gap-2 bg-[#DBE2E9]/60 backdrop-blur-md flex justify-start">
        {menu === "Profile" ? <MenuProfile user={user} /> : <MenuOption user={user} refetch={refetchData} />}
      </div>

      {/* Action Button - Back */}

        <button className="self-center md:mt-10 w-10 md:w-20 aspect-square border-2 border-silver rounded-md overflow-hidden hover-increase transition-transform" onClick={() => navigate("/")}>
          <img src="/pic/icons/back_btn.png" className="drop-shadow-lg w-full h-full object-cover"/>  
        </button>

        <div className="hidden md:flex" />
    
		</div>
		</>
	);
}

export const ProfilePage = withTranslation(ProfileP);
