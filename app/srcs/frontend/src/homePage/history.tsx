import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useOutletContext } from "react-router-dom";
import { apiFetchPrivate } from "../utils";
import type { User } from "../../../backend/share/type/user";
import type { MatchMeResponse, Match, TournamentMatch } from "../../../backend/share/type/history";

function PlayerInfo ({name} : { name: string }) {
  const avatarURL = `${import.meta.env.VITE_API_AVATAR}/default.webp?t=${Date.now()}`;
  //todo actually fetch user's avatar
  return (
    <div className="flex flex-col items-center w-15 text-center">
      <div className="relative h-13 aspect-square flex-shrink-0">
        <button className="aspect-square h-full rounded-full overflow-clip border-2 border-gray-300 disable" tabIndex={-1}>
          <img className="w-full h-full object-cover" src={avatarURL} />
        </button>
        <p className="mt-1 text-sm text-center text-gray-200 truncate w-full">{name}</p>
      </div>
    </div>
  );
}

const Versus = () => {
  return (
    <p className="font-semibold">vs</p>
  );
}

function Tournament ({ entries } : { entries: TournamentMatch }) {
  const [date, time] = entries.tournament.start_time.split(" ");

  return (
    <div className="flex justify-between items-center w-full">
      <div />
      <div className="flex justify-start items-center">
        <button className="w-13 aspect-square overflow-hidden disable" tabIndex={-1}>
          <img src="/pic/trophy.png" className="drop-shadow-lg w-full h-full object-cover"/>
        </button>
        <span className="font-bold p-2 text-center">Tournament</span>
      </div>
      <section className="flex items-center justify-between gap-0.5 mb-6">
        <PlayerInfo name={entries.matches[0].player1.username} />
        <Versus />
        <PlayerInfo name={entries.matches[0].player1.username} />
        <Versus />
        <PlayerInfo name={entries.matches[0].player1.username} />
        <Versus />
        <PlayerInfo name={entries.matches[0].player1.username} />
        {/* todo update as actual tournament */}
      </section>
      <section className="relative flex flex-col items-center justify-center font-semibold text-lg text-silver">
        <span>{date}</span>
        <span>{time}</span>
      </section>
      <div />
    </div>
  );
}

function Match ({isWinner, match} : { isWinner: boolean, match: Match }) {
  const [date, time] = match.game_time.split(" ");

  return (
    <div className="flex justify-between items-center w-full">
      <div />
      <span className="font-bold p-2">1 vs 1</span>
      <section className="flex items-center justify-between gap-0.5 mb-6">
        <PlayerInfo name={match.player1.username} />
        <Versus />
        <PlayerInfo name={match.player2.username} />
      </section>
        <span className="relative font-inter font-bold leading-[150%] text-golden
        [text-shadow:1px_1px_2px_rgba(0,0,0,0.6),-1px_-1px_2px_rgba(255,255,255,0.7)]">{match.player1.score} : {match.player2.score}</span>
      <section className="relative flex flex-col items-center justify-center font-semibold text-lg text-silver">
        <span>{date}</span>
        <span>{time}</span>
      </section>
      <span className={`${isWinner && "text-golden"} relative text-silver font-semibold text-lg`}>{isWinner ? "Won" : "Lose"}</span>  
      <div />
    </div>
  );
}

const HistoryRow = ({ match, user_id } : { match: Match | TournamentMatch, user_id: number} ) => {
  const isTournament = "tournament" in match;
  const isWinner = !isTournament && match.winner_id === user_id;//todo update after invoke ranking

  return (
    // <div     className={`relative p-2 rounded-lg flex items-center justify-between w-full h-full
    //   bg-[#79A0B0]/90
    //   shadow-md shadow-indigo-950/30
    //   transition-transform duration-200
    //   hover:bg-[#499898]/80 hover:shadow-lg hover:shadow-[#32525F]
    //   ${isTournament && "cursor-pointer hover:scale-98"}
    // `}
    // >

    <div
      className={`relative p-2 rounded-lg flex items-center justify-between w-full h-full
      bg-gradient-to-r from-[#879B99]/85 via-[#848A98]/85 to-[#848A98]/90
      shadow-lg shadow-indigo-950/20
      transition-transform duration-200 hover:shadow-md hover:shadow-[#AFC0EB]
      ${isTournament && "cursor-pointer hover:scale-98"} `}
    >

    {/* light falloff on bottom */} <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-[#000]/70 to-transparent pointer-events-none" />
    {/* glowing border */} <div className="absolute inset-0 rounded-lg ring-1 ring-indigo-300/60 hover:ring-indigo-400/70 transition-all duration-300 pointer-events-none" />

    { !isTournament? <Match isWinner={isWinner} match={match} /> : <Tournament entries={match} /> }

    </div>
  );
};
//todo a lightweight api that return {avatar}; or you know what? implement them in /match/me

const HistoryList = ({ matches, user_id } : { matches: (Match | TournamentMatch)[], user_id: number }) => {
  const records = [...matches, ...Array(5 - matches.length).fill(null)];
  return (
    <div className="h-full w-full grid grid-rows-5 ">
      {records.map((record, i) => (
        <div key={i} className="h-full p-1.5">
          {record ? <HistoryRow match={record} user_id={user_id} /> : <div></div>}
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
    <div className="w-screen h-screen grid grid-cols-[1fr_15%] bg-cover bg-center bg-blend-overlay"
      style={{
      // backgroundImage: " url('/pic/gray.jpg')"
      backgroundImage: " url('/pic/green.jpg')"
      }}
    >
    {/* bg-[#8d8dde] */}

        {/* Left side: History Matches; exactly 5 rows */}
        <section>
          {!matches ?
            <div className="flex flex-col justify-center items-center font-extrabold text-gray-300">No history yet...</div>
          : <HistoryList matches={matches.user_matches ?? []} user_id={matches.user_id} />}
        </section>

        {/* Right side: User's profile; as addition visual */}
        <section className="flex flex-col bg-[#182C2A] justify-center items-end gap-">
          <button className="relative bottom-0 w-15 aspect-square border-2 border-silver rounded-md overflow-hidden hover:scale-90 transition-transform" onClick={() => navigate("/")}>
            <img src="/pic/chira_改.png" className="drop-shadow-lg w-full h-full object-cover"/>  
          </button>
          <button className="relative bottom-0 w-15 aspect-square border-2 border-silver rounded-md overflow-hidden hover:scale-90 transition-transform" onClick={() => {console.log(matches)}}>
            <img src="/pic/heng.png" className="drop-shadow-lg w-full h-full object-cover"/>  
          </button>
        </section>

    </div>
    </>
  );
}
