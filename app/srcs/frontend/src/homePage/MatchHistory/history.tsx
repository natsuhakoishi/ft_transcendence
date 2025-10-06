import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useOutletContext } from "react-router-dom";
import { apiFetchPrivate } from "../../utils";
import type { User } from "../../../../backend/share/type/user";
import type { MatchMeResponse, Match, TournamentMatch } from "../../../../backend/share/type/history";
import { DateTime, PlayerInfo, ScoreBoard, Versus, WinStatus } from "./historyUtils";

function Tournament ({ won, entries } : { won: boolean, entries: TournamentMatch }) {
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
        <PlayerInfo name={entries.matches[0].player1.username} /> <Versus />
        <PlayerInfo name={entries.matches[0].player1.username} /> <Versus />
        <PlayerInfo name={entries.matches[0].player1.username} /> <Versus />
        <PlayerInfo name={entries.matches[0].player1.username} />
        {/* todo update as actual tournament participant*/}
      </section>

      <DateTime date={date} time={time} />
      <WinStatus won={won} />
      <div />

    </div>
  );
}

function Match ({won, match} : { won: boolean, match: Match }) {
  const [date, time] = match.game_time.split(" ");

  return (
    <div className="flex justify-between items-center w-full">

      <div />
      <span className="font-bold p-2">1 vs 1</span>

      <section className="flex items-center justify-between gap-0.5 mb-6">
        <PlayerInfo name={match.player1.username} /> <Versus />
        <PlayerInfo name={match.player2.username} />
      </section>

      <ScoreBoard P1={match.player1.score} P2={match.player2.score} won={won} />
      <DateTime date={date} time={time} />
      <WinStatus won={won} />
      <div />

    </div>
  );
}

function getBanner(tour : boolean) {
  return (!tour ?
    `bg-gradient-to-r from-[#879B99]/85 via-[#848A98]/85 to-[#848A98]/90` : 
    // `bg-gradient-to-r from-[#98877D]/85 via-[#C3AE53]/80 to-[#C3AE53]/85` //gold
    `bg-gradient-to-r from-[#6F698B]/85 via-[#C3AEAD]/85 to-[#C3AEAD]/90`
  );
}
``
const HistoryRow = ({ match, user_id } : { match: Match | TournamentMatch, user_id: number} ) => {
  const isTournament = "tournament" in match;
  const isWinner = !isTournament ? (match.winner_id === user_id) : (match.tournament.twinner_id === user_id);
  const bannerColour = getBanner(isTournament);

  return (
    <div
      className={`relative p-2 rounded-lg flex items-center justify-between w-full h-full
      shadow-xl shadow-indigo-950/20
      transition-transform duration-200 hover:shadow-md hover:shadow-[#9DD6AD]
      ${bannerColour} ${isTournament && "cursor-pointer hover:scale-98"} `}
    >

    {/* light falloff on bottom  */}
    <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-[#000]/70 to-transparent pointer-events-none" />
    {/* glowing border */}
    <div className="absolute inset-0 rounded-lg ring-1 ring-indigo-300/60 hover:ring-indigo-400/70 transition-all duration-300 pointer-events-none" />
    {/* Trigger Conditional Render betw Tournament & 1vs1 */}
    { !isTournament? <Match won={isWinner} match={match} /> : <Tournament won={isWinner} entries={match} /> }

    </div>
  );
};

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
        <section className="flex flex-col bg-[#1f3735] justify-center items-end gap-">
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

//memo how when username too long