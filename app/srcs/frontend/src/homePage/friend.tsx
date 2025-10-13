import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiFetchPrivate } from "../utils";
import { withTranslation } from "../_hooks/language.tsx";
import type { Friends } from "../../../backend/share/type/friend.ts";

const handleAddFriend = async (e: React.FormEvent<HTMLFormElement>, fetch: () => void, setT_Add: React.Dispatch<React.SetStateAction<boolean>>) => {
  e.preventDefault();
  const form = e.currentTarget;
  const elements = form.elements.namedItem("user_id") as HTMLInputElement;
  const input = elements.value.trim();
  try {
    await apiFetchPrivate("add_friend", { method: "POST", body: JSON.stringify({ "friend_adding": input }) });
    toast.success("Friend added.");
    fetch?.();
    setT_Add(false);
  } catch (err: any) {
    console.log(err.message);
    toast.error(err.message);
  }
};

export function Friend({ data, addFriend, fetch,  t = (key: string) => key, onClick }: {
  data?: Friends, addFriend?: boolean, fetch?: () => void, t?: (key: string) => string , onClick?: () => void,
}) {
  const [toggleAdd, setT_Add] = React.useState<boolean>(false);

  if (addFriend) {
    return (
    <>
      {toggleAdd && fetch ?
      (<form onSubmit={(event) => {handleAddFriend(event, fetch, setT_Add)}}
          className="flex flex-col items-center bg-[#F9DC7C]/70 rounded-2xl p-3 gap-1">
          <input type="text" placeholder={t("shared.form.place_userID")} required name="user_id"
            className="border rounded-md p-1 text-center w-[50%]" />
          <div className="flex justify-center items-center gap-1 text-lg">
            <button type="submit" className="bg-[#F9C57C]/70 rounded-md p-0.5 text-sm font-semibold hover:bg-[#FFC57C]/80 transition">✓</button>
            <button type="button" onClick={() => setT_Add(false)} className="bg-[#F9C57C]/70 rounded-md p-0.5 text-sm hover:bg-[#FFC57C]/80 transition">✘</button>
          </div>
        </form>
      ) :
      <button onClick={() => setT_Add(true)}
        className="flex flex-col justify-center items-center bg-[#F9DC7C]/70 rounded-2xl hover hover:scale-105 hover:bg-[#F9C57C]/70">
          <img src="/pic/icons/addFriend.png" className="w-10"/>
      </button>}
    </>
    );
  }

  if (!data) {
    return (
      <div className="bg-[#F6F2A9]/70 rounded-2xl opacity-60" />
    );
  }

  return (
    <div onClick={onClick} 
      className="relative flex w-full justify-start items-center bg-[#FFC7A2]/80 gap-4 p-3 rounded-2xl hover hover:bg-[#F9C57C]/70 transition flex-shrink-0"
    >
      <div className="relative">
        <img src={`${import.meta.env.VITE_API_AVATAR}${data.info.avatar_path}`}
          className="w-16 h-16 rounded-full object-cover border border-gray-300"/>
        <span className={`absolute bottom-0.5 right-0.5 w-3 aspect-square border-2 border-gray-300 rounded-full ${data.info.login_status ? "bg-online" : "bg-offline" }`}></span>
      </div>
      <span className="flex flex-col flex-grow text-lg mb-7">
        <p>{data.info.username}</p>
        <p className="text-xs italic">id: {data.info.id}</p>
      </span>
      {data.fstatus.mutual && <img src="/pic/icons/mutualStatus.png" className="w-10 flex-shrink-0" />}
    </div>
  );
}

const handleFDelete = async ( friend_id: number, fetch: () => void) => {
  try {
    await apiFetchPrivate("delete_friend", { method: "POST", body: JSON.stringify({ "friend_deleting": friend_id }) });
    toast.success("You have deleted your friend!");
    fetch();
  } catch (err: any) {
    toast.error(err.message);
    console.log(err.message);
  }
}

function FriendProfile({ setFModal, FProfile, handleFDelete, fetchFriends, t = (key: string) => key }: {
  setFModal: React.Dispatch<React.SetStateAction<boolean>>, FProfile: Friends,
  handleFDelete: (id: number, fetch: () => void) => void,
  fetchFriends: () => void, t?: (key: string) => string ,
}) {
  const [showConfirm, setShowConfirm] = React.useState<boolean>(false);

  const confirmDelete = () => {
    handleFDelete(FProfile.info.id, fetchFriends);
    setFModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 gap-1" onClick={() => setFModal(false)}>

      <div className="bg-[#FFCDB6] rounded-xl p-5 w-80 max-w-[90%] relative overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <img src={`${import.meta.env.VITE_API_AVATAR}${FProfile.info.avatar_path}`} className="w-24 h-24 rounded-full border-1 mx-auto"/>
        <h2 className="text-center text-lg font-bold mt-2">{FProfile.info.username}</h2>
        <p className="text-center text-xs italic">id: {FProfile.info.id}</p>
        <p className="">{t("shared.game_stat.won")}: {FProfile.info.win_games} {t("shared.game_stat.lose")} {FProfile.info.lose_games}</p>
        <p>{t("shared.game_stat.tournament")}: {FProfile.info.tournament_wins}</p>
        <p>{t("friend.mutual_status")}: {FProfile.fstatus.mutual ? t("friend.mutual_true") : t("friend.mutual_false")}</p>
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <button className="p-0.5 w-8 text-black rounded-full bg-[#ED4967] hover hover:brightness-90 transition" onClick={() => setShowConfirm(true)}
        >✘</button>
      </div>

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

export function FriendP({ t }: { t: (key: string) => string; }) {
  const navigate = useNavigate();
  const [friends, setFriends] = React.useState<Friends[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [FModal, setFModal] = React.useState<boolean>(false);
  const [selectedF, setSelectedF] = React.useState<Friends | null>(null);

  const fetchFriends = async () => {
    try {
      const data = await apiFetchPrivate("my_friends", { method: "POST", body: "{}", });
      setFriends(data.friends || []);
      setTotal(data.friends?.length || 0);
      console.log("Friends data fetched");
      // console.log(friends);
    } catch (err: any) {
      toast.error("Error when fetching friends");
    }
  };

  React.useEffect(() => {
    document.title = t("friend.title");
    fetchFriends();
}, []);

  return (
  <div className="relative flex flex-col h-screen w-screen bg-cover bg-center bg-[url('/pic/friendP.jpg')]">
  <div className="absolute inset-0 bg-black/50 z-0" />

    {/* Friend List */}
    <div className="relative z-10 flex-1 overflow-y-auto">
      {FModal && selectedF && <FriendProfile setFModal={setFModal} FProfile={selectedF} handleFDelete={handleFDelete} fetchFriends={fetchFriends} t={t} />}

      <div className="grid grid-cols-2 grid-rows-5 w-full max-w-3xl h-[88vh] mx-auto gap-3 p-2">
        {friends.slice(0, 10).map((f, i) => (
          <Friend key={i} data={f} t={t}
            onClick={() => { setSelectedF(f); setFModal(true); }} />
        ))}

        {friends.length < 10 && <Friend addFriend fetch={fetchFriends} t={t} />}

        {friends.length < 10 && Array.from({ length: Math.max(0, 9 - friends.length) }).map((_, i) => (
          <Friend key={`empty-${i}`} />
        ))}
      </div>

    </div>

    {/* Options Menu: Back, Refresh List, Total Friend */}
    <div className="relative z-10 flex items-center justify-center gap-2 p-1.5 bg-black/40 backdrop-blur-sm">
      <button className="w-13 aspect-square hover hover:scale-90 border-2 border-silver rounded-md overflow-hidden"
        onClick={() => navigate("/")}>
          <img src="/pic/icons/back_btn.png" className="w-full h-full object-cover"/>  
      </button>

      <button className="w-13 aspect-square hover hover:scale-90 border-2 border-silver rounded-md overflow-hidden"
        onClick={fetchFriends}>
          <img src="/pic/icons/refresh_btn.png" className="w-full h-full object-cover"/>  
      </button>

      <div className="flex items-center gap-2 border border-white p-1">
        <div className="w-5 h-5 bg-white mask-[url('/pic/icons/friends.svg')] mask-no-repeat mask-center" />
        <span className="text-white">{total}</span>
      </div>
    </div>

  </div>
	);
}

export const FriendPage = withTranslation(FriendP);