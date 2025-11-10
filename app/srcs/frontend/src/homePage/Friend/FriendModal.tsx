import React from "react";
import { useLang } from "../../_hooks/language";
import { apiFetchPrivate } from "../../utils";
import type { Friends } from "../../../../backend/share/type/friend";

export const handleFDelete = async ( friend_id: number, fetch: () => void, toasterPluz: (key: string) => void ) => {
  try {
    await apiFetchPrivate("delete_friend", { method: "POST", body: JSON.stringify({ "friend_deleting": friend_id }) });
    toasterPluz("friend.OK_DltFriend");
    fetch();
  } catch (err: any) {
    toasterPluz(err);
  }
}

export function FriendProfile({ setFModal, FProfile, handleFDelete, fetch }: {
  setFModal: React.Dispatch<React.SetStateAction<boolean>>,
  FProfile: Friends,
  handleFDelete: ( id: number, fetch: () => void, toasterPluz: (key: string) => void ) => void,
  fetch: () => void,
}) {

  const { t, toasterPluz  } = useLang();
  const [showConfirm, setShowConfirm] = React.useState<boolean>(false);
  const confirmDelete = () => {
    handleFDelete(FProfile.info.id, fetch, toasterPluz);
    setFModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 gap-1" onClick={() => setFModal(false)}>

      {/* Pop Up Modal -> Friend Profile */}
      <div className="bg-[#FFCDB6] rounded-xl p-5 w-80 max-w-[90%] relative" onClick={(e) => e.stopPropagation()}>
      
        {/* avatar */}
        <img src={`${import.meta.env.VITE_API_AVATAR}${FProfile.info.avatar_path}`} className="w-24 h-24 rounded-full border-1 mx-auto"/>
        {/* username */}
        <h2 className="text-center text-lg font-bold mt-2">{FProfile.info.username}</h2>
        {/* user id */}
        <p className="text-center text-xs italic">id: {FProfile.info.id}</p>
        {/* win & lose count */}
        <p className="">{t("shared.game_stat.won")}: {FProfile.info.win_games} {t("shared.game_stat.lose")} {FProfile.info.lose_games}</p>
        {/* tournament won count */}
        <p>{t("shared.game_stat.tournament")}: {FProfile.info.tournament_wins}</p>
        {/* mutual status */}
        <p>{t("friend.mutual_status")}: {FProfile.fstatus.mutual ? t("friend.mutual_true") : t("friend.mutual_false")}</p>
      
      </div>

      {/* Button -> Delete Friend */}
      <div onClick={(e) => e.stopPropagation()}>
        <button className="p-0.5 w-8 text-black rounded-full bg-[#ED4967] hover hover:brightness-90 transition" onClick={() => setShowConfirm(true)}
        >✘</button>
      </div>


      {/* Pop Up Modal - Confirmation Window on delete friend */}
      {showConfirm && (
        <div className="fixed inset-0 z-60 flex flex-col items-center justify-center bg-black/40 p-4" onClick={() => setShowConfirm(false)}>
          <div className="bg-[#FFCDB6] rounded-2xl p-5 w-72 max-w-[90%]" onClick={(e) => e.stopPropagation()}>
            <p className="text-center font-semibold mb-2">{t("friend.msg_deleteConfirm")}</p>
            <div className="flex gap-2">
              <button className="flex-1 p-2 bg-[#ED4967] text-white rounded-full hover:brightness-90 transition"
                onClick={confirmDelete}>{t("friend.btn_delete")}</button>
              <button className="flex-1 p-2 bg-[#F9F8F6] rounded-full hover:brightness-90 transition"
                onClick={() => setShowConfirm(false)}>{t("friend.btn_no")}</button>
            </div>
          </div>
        </div>
      )}

  </div>
  );
}