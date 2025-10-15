import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { apiFetchPrivate } from "../../utils";
import { useLang, withTranslation, type TranslationProps } from "../../_hooks/language";
import type { User } from "../../../../backend/share/type/user";
import type { MatchMeResponse, Match, TournamentMatch } from "../../../../backend/share/type/history";
import { DateTime, ModeIndicate, PlayerInfo, ScoreBoard, Versus, WinStatus } from "./historyUtils";

function ExpandTour ({ entries, user_id } : { entries: TournamentMatch | null, user_id: number, }) {
  console.log(entries);

  return ( entries && entries.matches && entries.matches.length >= 2 &&
    <div className="flex flex-col gap-2">
      <HistoryRow match={entries.matches[0]} user_id={user_id} onTournamentClick={() => {}}/>
      <HistoryRow match={entries.matches[1]} user_id={user_id} onTournamentClick={() => {}}/>
    </div>
  );
}

function Tournament ({ won, entries } : { won: Winner, entries: TournamentMatch, }) {
  const [date, time] = entries.tournament.start_time.split(" ");

  return (
    <div className="flex justify-between items-center w-full">
      <div />

      <div className="flex justify-start items-center">
        <button className="w-13 aspect-square overflow-hidden disable" tabIndex={-1}>
          <img src="/pic/icons/trophy.png" className="drop-shadow-lg w-full h-full object-cover"/>
        </button>
        <ModeIndicate mode="tour" />
      </div>

      <section className="flex items-center justify-between gap-0.5 mb-6">
        <PlayerInfo pInfo={entries.tournament.first} /> <Versus />
        <PlayerInfo pInfo={entries.tournament.second} /> <Versus />
        <PlayerInfo pInfo={entries.tournament.third} /> <Versus />
        <PlayerInfo pInfo={entries.tournament.last} />
      </section>

      <DateTime date={date} time={time} />
      <WinStatus won={won} />
      <div />

    </div>
  );
}

function Match ({won, match, isTour } : { won: Winner, match: Match , isTour: boolean, }) {
  const [date, time] = match.game_time.split(" ");

  return (
    <div className="flex justify-between items-center w-full">

      <div />
      <ModeIndicate mode={isTour ? "tourMatch" : "1vs1"} />

      <section className="flex items-center justify-between gap-0.5 mb-6">
        <PlayerInfo pInfo={match.player1} /> <Versus />
        <PlayerInfo pInfo={match.player2} />
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
    `bg-gradient-to-r from-[#6F698B]/85 via-[#C3AEAD]/85 to-[#C3AEAD]/90`
  );
}

export type Winner = 1 | 2 | 3 | 4 | false | true;

const HistoryRow = ({ match, user_id, onTournamentClick } : { 
  match: Match | TournamentMatch, user_id: number,
  onTournamentClick: (match: TournamentMatch) => void; }
) => {

  const isTour = "tournament" in match;
  const isTourM = "mode" in match && match.mode === "tournament";
  let isWinner: Winner = false;

  if (isTour) {
    const ranking = [match.tournament.first.id, match.tournament.second.id, match.tournament.third.id, match.tournament.last.id];
    const rankIndex = ranking.indexOf(user_id);
    if (rankIndex !== -1)
      isWinner = (rankIndex + 1) as Winner;
  }
  else
    isWinner = match.winner_id === user_id;

  const bannerColour = getBanner(isTour);

  return (
    <div
      className={`relative p-2 rounded-lg flex items-center justify-between w-full h-full
      shadow-xl shadow-indigo-950/20
      transition-transform duration-200 hover:shadow-md hover:shadow-[#9DD6AD]
      ${bannerColour} ${isTour && "cursor-pointer hover:scale-98"} `}
      onClick={() => { isTour && onTournamentClick(match) }}
    >

    {/* glowing border */}
    <div className="absolute inset-0 rounded-lg ring-1 ring-indigo-300/60 hover:ring-indigo-400/70 transition-all duration-300 pointer-events-none" />
    
    {/* Trigger Conditional Render betw Tournament & 1vs1 */}
    { isTour ? <Tournament won={isWinner} entries={match} /> : (
      isTourM ? <Match won={isWinner} match={match} isTour={true} /> : <Match won={isWinner} match={match} isTour={false} />
    )}

    </div>
  );
};

const HistoryList = ({ matches, user_id, onClickHandler } : {
  matches: (Match | TournamentMatch)[], user_id: number,
  onClickHandler: (match: TournamentMatch) => void;
}) => {
  const records = [...matches, ...Array(5 - matches.length).fill(null)];

  return (
  <div className="h-full w-full grid grid-rows-5 ">
    {records.map((record, i) => (
      <div key={i} className="h-full p-1.5">
        {!record ? <div/> :
          <HistoryRow match={record} user_id={user_id} onTournamentClick={onClickHandler} />
        }
      </div>
    ))}
  </div>
  );
};

function ExpandTourModal({ children, onClose, }: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const { t } = useLang();

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) { onClose(); }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
  <div className="fixed inset-0 z-40 grid grid-cols-[1fr_15%] bg-black/50">
    <div className="col-start-1 flex items-center p-2 ">
      <div ref={modalRef} className="
      bg-[#1f3735]/80 backdrop-blur-sm 
        border border-[#9DD6AD]/40 shadow-xl rounded-lg
        p-5 w-full h-[50%] overflow-ellipsis ">
          {children}
        <p className="text-white/80 text-sm mt-3 text-center"> {t("history.msg_closeTourPop")} </p>
      </div>
    </div>
  </div>
  );
}


export function HistoryP({ t, toasterPluz }: TranslationProps) {
  const navigate = useNavigate();
  const user = useOutletContext<User | null>();
  const [matches, setMatches] = useState<MatchMeResponse | null>(null);
  const [TourModal, setTourModal] = useState<boolean>(false);
  const [entries, setEntries] = useState<TournamentMatch | null>(null)

  const handleTournamentClick = (entries: TournamentMatch) => {
    setEntries(entries); setTourModal(true);
  };

  React.useEffect(() => {
    document.title = t("history.title");

    const fetchHistory = async () => {
      try {
        const data = await apiFetchPrivate("match/me", { method: "GET" });
        setMatches(data);
      } catch (err: any) {
        toasterPluz("ERR_fetchH");
      }
    };
    fetchHistory();
    
  }, []);

	return (
    <>
    <div className="w-screen h-screen grid grid-cols-[1fr_15%] bg-cover bg-center bg-black/20 bg-[url('/pic/historyP.jpg')] bg-blend-overlay">
  
      {/* Tournament Modal */}
      {TourModal && (
        <ExpandTourModal onClose={() => setTourModal(false)}>
          <ExpandTour entries={entries} user_id={matches?.user_id ?? 0} />
        </ExpandTourModal>
      )}

      {/* Left side: History Matches; exactly 5 rows */}
      <section>
      { !matches || !matches.user_matches || matches.user_matches.length === 0 ?
        (<>
          <div className="flex items-center w-full h-full font-semibold">
            <div className="bg-emerald-700/50  backdrop-blur-lg w-full h-[20%] text-center place-content-center">
              <p>{t("history.status_empty")}</p>
            </div>
          </div>
        </>)
        :
          <HistoryList matches={matches.user_matches ?? []} user_id={matches.user_id} onClickHandler={handleTournamentClick} />}
      </section>

      {/* Right side: User's profile; as addition visual */}
      <section className="flex flex-col bg-[#1f3735] justify-center items-end gap-">
        {/* Back Button */}
        <button className="relative bottom-0 w-15 aspect-square border-2 border-silver rounded-md overflow-hidden hover:scale-90 transition-transform" onClick={() => navigate("/")}>
          <img src="/pic/icons/back_btn.png" className="drop-shadow-lg w-full h-full object-cover"/>  
        </button>
        <button className="relative bottom-0 w-15 aspect-square border-2 border-silver rounded-md overflow-hidden hover:scale-90 transition-transform" onClick={() => {console.log(matches)}}>
          <img src="/pic/heng.png" className="drop-shadow-lg w-full h-full object-cover"/>  
        </button>
      </section>

    </div>
    </>
  );
}

export const HistoryPage = withTranslation(HistoryP);