import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { apiFetchPrivate } from "../../utils.ts";
import { withTranslation, type TranslationProps } from "../../_hooks/language.tsx";
import type { Friends } from "../../../../backend/share/type/friend.ts";
import type { User } from "../../../../backend/share/type/user.ts";
import { LoadingScreen } from "../HomeChildC.tsx";
import { Friend } from "./FriendCard.tsx";
import { FriendProfile, handleFDelete } from "./FriendModal.tsx";

export function FriendP({ t, toasterPluz }: TranslationProps) { 
  const navigate = useNavigate();
  const { user, loading } = useOutletContext<{user: User, loading: boolean}>();
  const [friends, setFriends] = React.useState<Friends[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [online, setOnline] = React.useState<number[]>([]);
  const [ready, setReady] = React.useState<boolean>(false);
  const [FModal, setFModal] = React.useState<boolean>(false);
  const [selectedF, setSelectedF] = React.useState<Friends | null>(null);

  const getOnline = async () => {
    //return a list of friends who is online
    const ws = new WebSocket(import.meta.env.VITE_API_ONLINE);
    let user_id: number;
    let friends_id: number[];
  
    user_id = user.acc.user_id;
    friends_id = friends.map(friend => friend.info.id) ?? [];

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "init", user: user_id, friends: friends_id }));
      console.log("Online_> Data sent");
      //start ping loop
    }

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === "init" || data.type === "update")
      {
        setOnline(data.list);
        setReady(true);
        online.length ? console.log("Online_> ",online) : console.log("Online_> -");
      }
    }

    ws.onerror = (err) => {
      console.log("WebSocket Error: \n", err);
    }

    return async () => {
      console.log("close user connection");
      await ws.send(JSON.stringify({ type: "offline", id: user_id }));
      ws.close();
    };
  };

  const fetchFriends = async () => {
    try {
      const data = await apiFetchPrivate("my_friends", { method: "POST", body: "{}", });
      setFriends(data.friends || []);
      setTotal(data.friends?.length || 0);
      console.log("Friends data fetched");
      // console.log(friends);
    } catch (err: any) {
      toasterPluz("friend.ERR_fetchF");
    }
  };

  React.useEffect(() => {
    document.title = t("friend.title");
    fetchFriends();
  }, []);

  React.useEffect(() => {
    if (!loading && user && friends)
      getOnline();
  }, [loading, user, friends]);

  return (
  <div className="relative flex flex-col h-screen w-screen bg-cover bg-center bg-[url('/pic/friendP.jpg')]">
  <div className="absolute inset-0 bg-black/50 z-0" />

    {/* Loading screen when online status not ready = = */}
    {!ready && 
      <div className="relative z-10 flex flex-col flex-1 items-center justify-center">
        <LoadingScreen progress={{step: t("loading.step_start"), completed: null, total: 1}} />
      </div>
    }

    {/* Body: Friends Card */}
    {ready &&
    <div className="relative z-10 flex-1">
      {/* Pop Up Modal -> Show friend profile */}
      {FModal && selectedF && <FriendProfile setFModal={setFModal} FProfile={selectedF} handleFDelete={handleFDelete} fetch={fetchFriends} />}

      {/* Different Kind of Friend Card (Shared one component) */}
      <div className="grid grid-cols-2 grid-rows-5 w-full max-w-3xl h-[88vh] mx-auto gap-3 p-2">
        {/* Normal Friend Card */}
        {friends.slice(0, 10).map((f, i) => {
          const isOnline = online.includes(f.info.id);
          return (
            <Friend key={i} data={f} onCardClick={() => { setSelectedF(f); setFModal(true); }} online={isOnline} />
          );
        })}

        {/* Special Friend Card -> Add Friend */}
        {friends.length < 10 && <Friend addFriend fetch={fetchFriends} />}

        {/* Special Friend Card -> Empty Friend :D */}
        {friends.length < 10 && Array.from({ length: Math.max(0, 9 - friends.length) }).map((_, i) => (
          <Friend key={`empty-${i}`} />
        ))}

      </div>

    </div>}

    {/* Footer: Button Menus - Back, Refresh, Total Friends */}
    {ready &&
    <div className="relative z-10 flex items-center justify-center gap-2 p-1.5 bg-black/40 backdrop-blur-sm">
      {/* Button -> Back */}
      <button className="w-13 aspect-square hover hover:scale-90 border-2 border-silver rounded-md overflow-hidden"
        onClick={() => navigate("/")}>
          <img src="/pic/icons/back_btn.png" className="w-full h-full object-cover"/>  
      </button>

      {/* Button -> Refresh */}
      <button className="w-13 aspect-square hover hover:scale-90 border-2 border-silver rounded-md overflow-hidden"
        onClick={async () => { await fetchFriends(); toasterPluz("friend.OK_refresh")} }>
          <img src="/pic/icons/refresh_btn.png" className="w-full h-full object-cover"/>  
      </button>

      {/* Display -> Total Friend */}
      <div className="flex items-center gap-2 border border-white p-1">
        <div className="w-5 h-5 bg-white mask-[url('/pic/icons/friends.svg')] mask-no-repeat mask-center" />
        <span className="text-white">{total}</span>
      </div>

    </div>}

  </div>
	);
}

export const FriendPage = withTranslation(FriendP);