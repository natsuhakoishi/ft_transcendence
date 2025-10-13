import React from "react";
import toast from "react-hot-toast"
import { useNavigate, useOutletContext } from "react-router-dom";
import { apiFetch } from "../../utils.ts";
import type { User } from "../../../../backend/share/type/user";
import { MenuOption } from "./profileOption";
import { withTranslation } from "../../_hooks/language.tsx";

const handleLogOut = async (navigate: (path: string) => void) => {
  try {
    await apiFetch("logout", { method: "POST", body: JSON.stringify({}) });
    toast.success("Log out.");
    navigate("/auth");
  } catch (err: any) {
    console.error("Issue: " + err.message);
    if (err.message.includes("Failed to fetch"))
      toast.error("Server Error");
    else
      toast.error(err.message);
  }
}

function MenuProfile( { user, t } : { user: User | null, t: (key: string) => string } ) {
  const avatarURL = `${import.meta.env.VITE_API_AVATAR}/${user?.profile?.avatar_path}?t=${Date.now()}`;
  const { win_games = 0, lose_games = 0, tournament_wins = 0, total_game = 0, win_rate = 0.0 } = user?.profile || {};
  const displayDash = (num: number) => (num === 0 ? "-" : num);

  return (
    <>
    <div className="mb-10 mt-1 inset-0 w-screen h-[50%] shadow-md shadow-gray-400 gap-2 bg-[#DBE2E9]/40 backdrop-blur-md flex justify-start">

    {/* Upper section - Avatar, Username, Online Status, User Id */}
    <div className="flex flex-col mt-5">
      <div className="flex h-[40%] my-2 mx-3 p-0.5 items-start gap-3">
        <div className="relative h-16 aspect-square">
          <button className="aspect-square h-full rounded-full overflow-clip border-2 border-gray-300 disable" tabIndex={-1}>
            <img className="w-full h-full object-cover" src={avatarURL} />
          </button>
          <span className="absolute bottom-2 right-0 w-3 aspect-square bg-[#43A25A] rounded-full"></span>
        </div>
        <div className="mx-1 font-semibold">
          <span className="text-3xl text-gray-800">{user ? user?.acc.username : "Username"}</span>
          <p className="text-md italic text-[#848A98]">ID: {user ? user?.acc.user_id : "-"}</p> 
        </div>
      </div>

      <div className="flex-1" />
    {/* Bottom section - Game stats, ex. win, lost, tournament win, win rate */}
      <div className="flex flex-1 flex-col gap-2 mx-10 justify-start align-middle">
        {/* First row */}
        <div className="flex gap-3 text-xl">
          <span>{t("shared.game_stat.won")}</span>
          <span className="font-inter font-bold leading-[150%] text-golden
            [text-shadow:1px_1px_2px_rgba(0,0,0,0.6),-1px_-1px_2px_rgba(255,255,255,0.7)]">{displayDash(win_games)}</span>
          <span>{t("shared.game_stat.lose")}</span>
          <span className="font-inter font-bold leading-[150%] text-silver
            [text-shadow:1px_1px_2px_rgba(80,80,80,0.6),-1px_-1px_2px_rgba(200,200,200,0.7)]">{displayDash(lose_games)}</span>
          <span className="ml-3 row-span-2">{t("shared.game_stat.tournament")}</span>
          <span className="font-inter font-bold leading-[150%] text-golden
            [text-shadow:1px_1px_2px_rgba(0,0,0,0.6),-1px_-1px_2px_rgba(255,255,255,0.7)]">{displayDash(tournament_wins)}</span>
        </div>

        {/* Second row */}
        <div className="flex ml-0.5 gap-5 text-xl">
          <span className="font-bold">{t("shared.game_stat.total_match")}</span>
          <span className="font-inter font-bold leading-[150%] text-[#E5EBF7]">{displayDash(total_game)}</span>
          <span className="font-bold">{t("shared.game_stat.win_rate")}</span>
          <span className="font-inter font-bold leading-[150%] text-silver
            [text-shadow:1px_1px_2px_rgba(80,80,80,0.6),-1px_-1px_2px_rgba(200,200,200,0.7)]">{!win_rate ? "-" : `${win_rate}%`}</span>
        </div>

      </div>
      <div className="flex-1" />
    </div>

    </div>
    </>
  );
}

export function ProfileP({ t }: { t: (key: string) => string; }) {
  const navigate = useNavigate();
  const [menu, setMenu] = React.useState<"Profile" | "Option">("Profile");
  const { user, refetchData } = useOutletContext<{user: User | null, refetchData: () => void}>();

  React.useEffect(() => {
    document.title = t("profile.title");
  }, []);

	return (
		<>
    <div className="w-screen h-screen gap-2 flex flex-col bg-cover bg-center bg-blend-overlay
      bg-[linear-gradient(to_bottom,#6FB7FFcc,#daade0ac,#A79BFFcc),url('/pic/profileP.jpg')]"
    >

      {/* Menu Buttons: 'Profile' 'Option' 'Log Out' */}
      <div className="flex gap-5 mt-10 ml-5">
        <button className={`border-2 p-1 hover-increase ${menu === "Profile" ? "text-sky-200 border-sky-200" : "text-[#E5EBF7] border-[#E5EBF7]"}`}
          onClick={() => setMenu("Profile")}>{t("profile.btn_profile")}</button>
        <button className={`border-2 p-1 hover-increase ${menu === "Option" ? "text-sky-200 border-sky-200" : "text-[#E5EBF7] border-[#E5EBF7]"}`} 
          onClick={() => setMenu("Option")}>{t("profile.btn_option")}</button>
        <button className="text-white border-white bg-[#f199c4] border-2 p-1 hover-increase" onClick={() => handleLogOut(navigate)}>{t("profile.btn_log_out")}</button>
      </div>

      {menu === "Profile" ? <MenuProfile user={user} t={t} /> : <MenuOption user={user} refetch={refetchData} t={t} />}

      {/* Action Button - Back */}
      <div className="flex flex-1 items-center justify-center">
        <button className="relative bottom-5 center-0 w-20 aspect-square border-2 border-silver rounded-md overflow-hidden hover:scale-90 transition-transform" onClick={() => navigate("/")}>
          <img src="/pic/icons/back_btn.png" className="drop-shadow-lg w-full h-full object-cover"/>  
        </button>
		  </div>
		</div>
		</>
	);
}

export const ProfilePage = withTranslation(ProfileP);
