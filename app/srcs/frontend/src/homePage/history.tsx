import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useOutletContext } from "react-router-dom";
import { apiFetchPrivate } from "../utils";
import type { User } from "../../../backend/share/type/user";
import type { MatchMeResponse, Match, TournamentMatch } from "../../../backend/share/type/history";

const HistoryRow = ({ record, user_id } : { record: Match | TournamentMatch, user_id: number} ) => {
  const isTournament = "tournament" in record;
  const isWin = !isTournament && record.winner_id === user_id;//todo update after invoke ranking

  return (
    <div className={`p-2 rounded-lg flex items-center justify-between w-full h-full
      transition-transform duration-200 hover:bg-indigo-800
      ${isTournament && "cursor-pointer hover:scale-98"} `}
    >

    {/* Mode Indicator /*} {/* todo upgrade to conditional render component */}
    {/* Participant */} {/* todo split into reuseable User component */}
    {/* Score */}
    {/* Game Time */}
    {/* Result */}

    </div>
  );
};

const HistoryList = ({ matches, user_id } : { matches: (Match | TournamentMatch)[], user_id: number }) => {
  const records = [...matches, ...Array(5 - matches.length).fill(null)];
  return (
    <div className="h-full w-full grid grid-rows-5 ">
      {records.map((record, i) => (
        <div key={i} className="h-full p-0.5">
          {record ? <HistoryRow record={record} user_id={user_id} /> : <div></div>}
        </div>
      ))}
    </div>
  );
};

export function HistoryPage() {
  const navigate = useNavigate();
  const user = useOutletContext<User | null>();
  const [matches, setMatches] = useState<MatchMeResponse | null>(null);

  React.useEffect(() => {
    document.title = "KLBQ | History";

    const fetchHistory = async () => {
      try {
        const data = await apiFetchPrivate("match/me", { method: "GET" });
        setMatches(data);
      } catch (err: any) {
        toast.error("Fail to fetch history");
      }
    };
    fetchHistory();
    
  }, []);

	return (
    <>
    <div className="w-screen h-screen grid grid-cols-[1fr_15%] bg-[#2f2f6e]">

        {/* Left side: History Matches; exactly 5 rows */}
        <section>
          {!matches ?
            <div className="flex flex-col justify-center items-center font-extrabold text-gray-300">No history yet...</div>
          : <HistoryList matches={matches.user_matches ?? []} user_id={matches.user_id} />}
        </section>

        {/* Right side: User's profile; as addition visual */}
        <section className="flex flex-col bg-indigo-950 justify-center items-end gap-">
          <button className="relative bottom-0 w-15 aspect-square border-2 border-silver rounded-md overflow-hidden hover:scale-90 transition-transform" onClick={() => navigate("/")}>
            <img src="/pic/chira_改.png" className="drop-shadow-lg w-full h-full object-cover"/>  
          </button>
          <button className="relative bottom-0 w-15 aspect-square border-2 border- rounded-md overflow-hidden hover:scale-90 transition-transform" onClick={() => {console.log(matches)}}>
            <img src="/pic/heng.png" className="drop-shadow-lg w-full h-full object-cover"/>  
          </button>
        </section>

    </div>
    </>
  );
}
