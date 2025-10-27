import React from "react";
import { useNavigate } from "react-router-dom";
import { apiFetchPrivate } from "../../utils.ts";
import { withTranslation, type TranslationProps } from "../../_hooks/language.tsx";
import type { Friends } from "../../../../backend/share/type/friend.ts";
import { LoadingScreen } from "../HomeChildC.tsx";
import { Friend } from "./FriendCard.tsx";
import { FriendProfile, handleFDelete } from "./FriendModal.tsx";
import { useSocket } from "../fetchHelper.tsx";

export function FriendP({ t, toasterPluz }: TranslationProps) { 
  const navigate = useNavigate();
  const [friends, setFriends] = React.useState<Friends[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [FModal, setFModal] = React.useState<boolean>(false);
  const [selectedF, setSelectedF] = React.useState<Friends | null>(null);
  const { onlineUsers, socket } = useSocket();

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

return (
  <>
  {/* Background Layer */}
  <div className="absolute inset-0 -z-10 bg-cover bg-center bg-[url('/pic/friendP.jpg')] bg-black/50 bg-blend-overlay overflow-y-hidden" />
  {/* Page Content - Conditional Render [ Loading / Friend Page ] */}
  {
    !socket ?
      <LoadingScreen progress={{step: t("loading.step_start"), completed: null, total: 1}} />
    :
      (<div className="relative flex flex-col h-[100dvh] md:h-[100dvh] w-[100dvw] md:overflow-hidden">

        {/* Body: Friends Card */}
        <div className="flex-grow md:flex-none md:h-[89%] overflow-hidden">
          {/* Pop Up Modal -> Show friend profile */}
          {FModal && selectedF && <FriendProfile setFModal={setFModal} FProfile={selectedF} handleFDelete={handleFDelete} fetch={fetchFriends} />}

          {/* Different Kind of Friend Card (Shared one component) */}
          <div className="mx-auto grid grid-cols-2 gap-3 p-2 max-w-5xl h-full 
            overflow-y-scroll md:overflow-hidden grid-rows-[repeat(5,minmax(0,1fr))] md:grid-rows-5"
            style={{
              scrollSnapType: 'y mandatory',
            }}
          >
            {/* Normal Friend Card */}
            {friends.slice(0, 10).map((f, i) => {
              console.log(onlineUsers);
              const isOnline = onlineUsers?.some(user => user.id === f.info.id) ?? false;
              return (
                <Friend key={i} data={f} onCardClick={() => { setSelectedF(f); setFModal(true); }} online={isOnline}  />
              );
            })}

            {/* Special Friend Card -> Add Friend */}
            {friends.length < 10 && <Friend addFriend fetch={fetchFriends} />}

            {/* Special Friend Card -> Empty Friend :D */}
            {friends.length < 10 && Array.from({ length: Math.max(0, 9 - friends.length) }).map((_, i) => (
              <Friend key={`empty-${i}`} />
            ))}

          </div>

        </div>

        {/* Footer: Button Menus - Back, Refresh, Total Friends */}
        <div className="flex items-center justify-center gap-2 p-1.5 bg-black/40 backdrop-blur-sm">
          {/* Button -> Back */}
          <button className="w-7 md:w-13 aspect-square hover hover:scale-90 border-1 md:border-2 border-silver rounded-md overflow-hidden"
            onClick={() => navigate("/")}>
              <img src="/pic/icons/back_btn.png" className="w-full h-full object-cover"/>  
          </button>

          {/* Button -> Refresh */}
          <button className="w-7 md:w-13 aspect-square hover hover:scale-90 border-1 md:border-2 border-silver rounded-md overflow-hidden"
            onClick={async () => { await fetchFriends(); toasterPluz("friend.OK_refresh")} }>
              <img src="/pic/icons/refresh_btn.png" className="w-full h-full object-cover"/>  
          </button>

          {/* Display -> Total Friend */}
          <div className="flex items-center gap-1 md:gap-2 border border-white rounded-md p-0.5 md:p-2">
            <div className="w-3 h-3 md:w-7 md:h-7 bg-white mask-[url('/pic/icons/friends.png')] [mask-size:contain] mask-no-repeat mask-center" />
            <span className="text-white font-semibold">{total}</span>
          </div>

        </div>

      </div>)
  }
  </>
);
}

export const FriendPage = withTranslation(FriendP);