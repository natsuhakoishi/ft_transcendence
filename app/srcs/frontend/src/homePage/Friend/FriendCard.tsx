import React from "react";
import { useLang } from "../../_hooks/language";
import type { Friends } from "../../../../backend/share/type/friend";
import { apiFetchPrivate } from "../../utils";

const handleAddFriend = async (
  e: React.FormEvent<HTMLFormElement>,
  fetch: () => void,
  setT_Add: React.Dispatch<React.SetStateAction<boolean>>,
  toasterPluz: (key: string) => void
) => {

  e.preventDefault();
  const form = e.currentTarget;
  const elements = form.elements.namedItem("user_id") as HTMLInputElement;
  const input = elements.value.trim();

  try {
    await apiFetchPrivate("add_friend", { method: "POST", body: JSON.stringify({ "friend_adding": input }) });
    toasterPluz("friend.OK_AddFriend");
    fetch?.();
    setT_Add(false);
  } catch (err: any) {
    toasterPluz(err);
  }
};

export function Friend({ data, addFriend, fetch, onCardClick, online }: {
  data?: Friends,
  addFriend?: boolean,
  fetch?: () => void,
  onCardClick?: () => void,
  online?: boolean,
}) {

  const { t, toasterPluz } = useLang();
  const [toggleAdd, setT_Add] = React.useState<boolean>(false);

  {/* Add Friend Card */}
  if (addFriend) {
    return (
    <>
    {toggleAdd && fetch ?
      (<form onSubmit={(event) => {handleAddFriend(event, fetch, setT_Add, toasterPluz)}}
       className="flex flex-col items-center justify-center bg-[#F9DC7C]/70 rounded-2xl p-3 gap-1">
        {/* Placeholder for friend id */}
        <input type="text" placeholder={t("shared.form.place_userID")} required name="user_id"  className="border rounded-md p-1 text-center w-[50%]" />

        <div className="flex justify-center items-center gap-1 text-lg">
          <button type="submit" className="bg-[#F9C57C]/70 rounded-md p-0.5 text-sm font-semibold hover:bg-[#FFC57C]/80 transition">✓</button>
          <button type="button" onClick={() => setT_Add(false)} className="bg-[#F9C57C]/70 rounded-md p-0.5 text-sm hover:bg-[#FFC57C]/80 transition">✘</button>
        </div>

      </form>)
        :
      <button onClick={() => setT_Add(true)}
        className="flex flex-col justify-center items-center bg-[#F9DC7C]/70 rounded-2xl hover hover:scale-103 hover:bg-[#F9C57C]/70">
          <img src="/pic/icons/addFriend.png" className="w-10"/>
      </button>
    }
    </>
    );
  }

  {/* Empty Friend Card */}
  if (!data)
    return ( <div className="bg-[#F6F2A9]/70 rounded-2xl opacity-60" /> );

  {/* Normal Friend Card */}
  return (
    <div onClick={onCardClick} 
      className="relative flex w-full h-full justify-start items-center bg-[#FFC7A2]/80 gap-4 p-3 rounded-2xl hover hover:bg-[#F9C57C]/70 transition"
    >
      {/* avatar & login Status */}
      <div className="relative">
        <img src={`${import.meta.env.VITE_API_AVATAR}${data.info.avatar_path}`}
          className="aspect-square w-12 md:w-20 rounded-full object-cover border border-gray-300"/>
        <span className={`absolute bottom-0.5 right-0.5 w-3 aspect-square border-2 border-gray-300 rounded-full ${online ? "bg-online" : "bg-offline" }`}></span>
      </div>
      {/* username & id */}
      <span className="flex flex-col flex-grow text-lg mb-7">
        <p>{data.info.username}</p>
        <p className="text-xs italic">id: {data.info.id}</p>
      </span>
      {/* mutual friend indicator */}
      {data.fstatus.mutual && <img src="/pic/icons/mutualStatus.png" className="w-10 flex-shrink-0" />}
    </div>
  );
}