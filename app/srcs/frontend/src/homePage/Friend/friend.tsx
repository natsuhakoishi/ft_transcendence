import React from "react";
import { useNavigate } from "react-router-dom";
import { apiFetchPrivate } from "../../utils.ts";
import { withTranslation, type TranslationProps } from "../../_hooks/language.tsx";
import type { Friends } from "../../../../backend/share/type/friend.ts";
import { LoadingScreen } from "../HomeComponents.tsx";
import { Friend } from "./FriendCard.tsx";
import { FriendProfile, handleFDelete } from "./FriendModal.tsx";
import { useSocket } from "../helpers.tsx";

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
  <div className="absolute h-[100dvh] w-[100dvw] inset-0 -z-10 bg-cover bg-center bg-[url('/pic/friendP.jpg')] bg-black/50 bg-blend-overlay overflow-auto md:overflow-clip" />
  {/* Page Content - Conditional Render [ Loading / Friend Page ] */}
  {
    !socket ?
      <LoadingScreen progress={{step: t("loading.step_start"), completed: null, total: 1}} />
    :
      (<div className="relative flex flex-col h-[100svh] w-[100svw] overflow-auto md:overflow-clip">

        {/* Body: Friends Card */}
        <div className="flex-grow md:flex-none md:h-[90%]">
          {/* Pop Up Modal -> Show friend profile */}
          {FModal && selectedF && <FriendProfile setFModal={setFModal} FProfile={selectedF} handleFDelete={handleFDelete} fetch={fetchFriends} />}

          {/* Different Kind of Friend Card (Shared one component) */}
          <div className="w-[90%] h-[90dvh] p-0.5 md:p-2 gap-3 mx-auto
            grid grid-cols-2 grid-rows-5 md:max-w-4xl"
          >
            {/* Normal Friend Card */}
            {friends.slice(0, 10).map((f, i) => {
              // console.log(onlineUsers);
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
        <div className="md:h-[10%] h-[10dvh] flex items-center justify-center gap-2 p-1.5 bg-black/40 backdrop-blur-sm">
          {/* Button -> Back */}
          <button className="w-7 md:w-13 aspect-square hover hover:scale-90 border-1 md:border-2 border-silver rounded-md overflow-hidden"
            onClick={() => navigate("/")}>
              <img src="/pic/icons/back_btn.png" className="w-full h-full object-cover"/>
          </button>

          {/* Button -> Refresh */}
          <button className="w-7 md:w-13 aspect-square hover hover:scale-90 border-1 md:border-2 border-silver rounded-md overflow-hidden"
            onClick={async () => {
              await fetchFriends();
              toasterPluz("friend.OK_refresh");
              if (socket.readyState === WebSocket.OPEN)
                socket.send(JSON.stringify({ type: "update" }));
            }}>
              <img src="/pic/icons/refresh_btn.png" className="w-full h-full object-cover"/>
          </button>

          {/* Display -> Total Friend */}
          <div className="flex items-center gap-1 md:gap-2 border border-white rounded-md p-0.5 md:p-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 md:size-8 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            <span className="text-white text-sm md:text-xl font-bold">{total}</span>
          </div>

        </div>

      </div>)
  }
  </>
);
}

export const FriendPage = withTranslation(FriendP);
