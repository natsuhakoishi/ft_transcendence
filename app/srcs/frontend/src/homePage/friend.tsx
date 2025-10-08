import React from "react";
import { useNavigate } from "react-router-dom";
import { apiFetchPrivate } from "../utils";
import toast from "react-hot-toast";
import type { Friends } from "../../../backend/share/type/friend.ts";

interface FriendProps {
  data?: Friends;
  addFriend?: boolean;
  fetch?: () => void;
}

export function Friend({ data, addFriend, fetch }: FriendProps) {
  const [toggleAdd, setToggleAdd] = React.useState<boolean>(false);
  const [userIdInput, setUserIdInput] = React.useState<string>("");

  // const handleDeleteF = async 

  const handleAddFriend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await apiFetchPrivate("add_friend", { method: "POST", body: JSON.stringify({ "friend_adding": userIdInput }) });
      toast.success("Friend added.");
      fetch?.();
      setToggleAdd(false);
      setUserIdInput("");
    } catch (err: any) {
      console.log(err.message);
      toast.error(err.message);
    }
  };
  
  if (addFriend) {
    return (
    <>
    {toggleAdd ? (
         <form
            onSubmit={handleAddFriend}
            className="flex flex-col items-center bg-[#F9DC7C]/70 rounded-2xl p-3 gap-0.5"
          >
            <input 
              type="text"
              placeholder="Enter user ID"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              className="border rounded-md p-1 text-center w-25"
              required
            />
            <button
              type="submit"
              className="bg-[#F9C57C]/70 rounded-md p-1 text-sm hover:bg-[#FFC57C]/80 transition"
            >
              Add Friend
            </button>
          </form>
        ) :
      <button
        onClick={() => setToggleAdd(true)}
        className="flex flex-col justify-center items-center bg-[#F9DC7C]/70 rounded-2xl hover:bg-[#F9C57C]/70 hover:cursor-pointer hover:scale-105 transition"
      >
        <img src="/pic/icons/addFriend.png" className="w-10"/>
        <span className="text-sm mt-1">Add Friend</span>
      </button>
    }
    </>
    );
  }

  if (!data) {
    return (
      <div className="bg-[#F6F2A9]/70 rounded-2xl opacity-60" />
    );
  }

  return (
    <div
      className="flex w-full justify-start items-center bg-[#FFC7A2]/80 gap-4 p-3 rounded-2xl hover:bg-[#F9C57C]/70 transition flex-shrink-0"
    >
      <img src={`${import.meta.env.VITE_API_AVATAR}${data.info.avatar_path}`}
        className="w-16 h-16 rounded-full object-cover border border-gray-300"/>
      <span className="flex flex-col flex-grow text-lg mb-7">
        <p>{data.info.username}</p>
        <p className="text-xs italic">id: {data.info.id}</p>
      </span>
      {data.fstatus.mutual && <img src="/pic/icons/mutualStatus.png" className="w-10 flex-shrink-0" />}
    </div>
  );
}

export function FriendPage() {
  const navigate = useNavigate();
  const [friends, setFriends] = React.useState<Friends[]>([]);
  const [total, setTotal] = React.useState<number>(0);

  const fetchFriends = async () => {
    try {
      const data = await apiFetchPrivate("my_friends", { method: "POST", body: "{}", });

      if (data.friends.length > 0) {
        setFriends(data.friends);
        setTotal(data.friends.length);
      }
      console.log("Friends data fetched.");
    } catch (err: any) {
      toast.error("Error when fetching friends");
    }
  };

  React.useEffect(() => {
    document.title = "KLBQ | Friends";
    fetchFriends();
}, []);

  return (
  <div className="relative flex flex-col h-screen w-screen bg-cover bg-center"
    style={{
      backgroundImage: "url('/pic/friendP.jpg')"
  }}>
  <div className="absolute inset-0 bg-black/50 z-0" />

    {/* Friend List */}
    <div className="relative z-10 flex-1 overflow-y-auto">

      <div className="
        grid grid-cols-2 grid-rows-5 w-full max-w-3xl h-[90vh] mx-auto gap-3 p-3">
        {friends.slice(0, 10).map((f, i) => (
          <Friend key={i} data={f} />
        ))}
        {friends.length < 10 && (
          <Friend addFriend fetch={fetchFriends}/>
        )}
        {friends.length < 10 && Array.from({ length: Math.max(0, 9 - friends.length) }).map((_, i) => (
          <Friend key={`empty-${i}`} />
        ))}
      </div>

    </div>

    {/* Options Menu: Back, Refresh List, Total Friend */}
    <div className="relative z-10 flex items-center justify-center gap-2 p-1.5 bg-black/40 backdrop-blur-sm">

      <button className="relative bottom-0 w-13 aspect-square border-2 border-silver rounded-md overflow-hidden hover:scale-90 transition-transform" onClick={() => navigate("/")}>
        <img src="/pic/back_btn.png" className="drop-shadow-lg w-full h-full object-cover"/>  
      </button>

      <button className="relative bottom-0 w-13 aspect-square border-2 border-silver rounded-md overflow-hidden hover:scale-90 transition-transform"
        onClick={() => console.log(friends)}>
        <img src="/pic/heng.png" className="w-full h-full object-cover"/>  
      </button>

      <div className="flex items-center gap-2 border border-white p-1">
        <div className="w-5 h-5 bg-white mask-[url('/pic/icons/friends.svg')] mask-no-repeat mask-center" />
        <span className="text-white">{total}</span>
      </div>

    </div>

  </div>
	);
}