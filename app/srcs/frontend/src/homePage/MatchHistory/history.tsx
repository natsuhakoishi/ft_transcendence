import React, { useState } from "react";
import { apiFetchPrivate } from "../../utils";
import { useLang, withTranslation, type TranslationProps } from "../../_hooks/language";
import type { MatchMeResponse, Match, TournamentMatch } from "../../../../backend/share/type/history";
import { DateTime, ModeIndicate, PlayerInfo, ScoreBoard, Versus, WinStatus } from "./HistoryChildC";
import { ProfileSideBar } from "./ProfileSidebar";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { LoadingScreen } from "../HomeChildC";
import type { User } from "../../../../backend/share/type/user";
import type { Friends } from "../../../../backend/share/type/friend";

function ExpandTour ({ entries, user_id } : { entries: TournamentMatch | null, user_id: number, }) {
  // console.log(entries);

  return ( entries && entries.matches && entries.matches.length >= 2 &&
    <div className="flex flex-col gap-2 h-[90%]">
      <HistoryRow match={entries.matches[0]} user_id={user_id} onTournamentClick={() => {}}/>
      <HistoryRow match={entries.matches[1]} user_id={user_id} onTournamentClick={() => {}}/>
    </div>
  );
}

function Tournament ({ id, won, entries } : { id: number, won: Winner, entries: TournamentMatch, }) {
  const new_date = new Date(entries.tournament.start_time + "Z");
  const local_date = new_date.toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', hour12: false, });
  const [date, time] = local_date.split(", ");

  return (
    <div className="flex justify-between items-center w-full">
      <div className="hidden md:block"/>

      <div className="flex justify-start items-center">
        <button className="hidden md:block w-10 md:w-13 aspect-square overflow-hidden disable" tabIndex={-1}>
          <img src="/pic/icons/trophy.png" className="drop-shadow-lg w-full h-full object-cover"/>
        </button>
        <ModeIndicate mode="tour" />
      </div>

      <section className="flex items-center justify-between gap-0.5 mb-6">
        <PlayerInfo id={id} pInfo={entries.tournament.first} /> <Versus />
        <PlayerInfo id={id} pInfo={entries.tournament.second} /> <Versus />
        <PlayerInfo id={id} pInfo={entries.tournament.third} /> <Versus />
        <PlayerInfo id={id} pInfo={entries.tournament.last} />
      </section>

      <DateTime date={date} time={time} />
      <WinStatus won={won} />
      <div className="hidden md:block"/>

    </div>
  );
}

function Match ({ id, won, match, isTour } : { id: number, won: Winner, match: Match , isTour: boolean, }) {
  const new_date = new Date(match.game_time + "Z");
  const local_date = new_date.toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', hour12: false, });
  const [date, time] = local_date.split(", ");
  const isUser = id === match.player1.user_id ? 1 : 2;

  return (
    <div className="flex justify-between items-center w-full">

      <div />
      <ModeIndicate mode={isTour ? "tourMatch" : "1vs1"} />

      <section className="flex items-center justify-between gap-0.5 mb-6">
        <PlayerInfo id={id} pInfo={match.player1} /> <Versus />
        <PlayerInfo id={id} pInfo={match.player2} />
      </section>

      <ScoreBoard P1={match.player1.score} P2={match.player2.score} won={won} isUser={isUser} />
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
  match: Match | TournamentMatch,
  user_id: number,
  onTournamentClick: (match: TournamentMatch) => void; }
) => {

  const isTour = "tournament" in match;
  const isTourM = "mode" in match && match.mode === "tournament";
  let isWinner: Winner = false;

  if (isTour)
  {
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
      className={`relative p-2 rounded-lg flex items-center justify-between md:w-full md:h-full
      shadow-xl shadow-indigo-950/20
      transition-transform duration-200 hover:shadow-md hover:shadow-[#9DD6AD]
      ${bannerColour} ${isTour && "cursor-pointer hover:scale-98"} `}
      onClick={() => { isTour && onTournamentClick(match) }}
    >

    {/* glowing border */}
    <div className="absolute inset-0 rounded-lg ring-1 ring-indigo-300/60 hover:ring-indigo-400/70 transition-all duration-300 pointer-events-none" />

    {/* Trigger Conditional Render betw Tournament & 1vs1 */}
    { isTour ? <Tournament id={user_id} won={isWinner} entries={match} /> : (
      isTourM ? <Match id={user_id} won={isWinner} match={match} isTour={true} /> : <Match id={user_id} won={isWinner} match={match} isTour={false} />
    )}

    </div>
  );
};

const HistoryList = ({ matches, user_id, onClickHandler } : {
  matches: (Match | TournamentMatch)[],
  user_id: number,
  onClickHandler: (match: TournamentMatch) => void;
}) => {
  const records = [...matches, ...Array(5 - matches.length).fill(null)];

  return (
    <div className="h-[100dvh] w-full flex flex-col p-0.5 overflow-x-hidden
      md:h-full md:grid md:grid-rows-5 md:overflow-hidden"
    >
      {records.map((record, i) => (
        <div key={i} className="flex-1 p-0.5 md:h-full md:p-1.5">
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
    <div className="fixed inset-0 z-40 flex md:grid md:grid-cols-[1fr_15%] bg-black/50">
      <div className="col-start-1 flex md:items-center p-2 w-[80%] md:w-full h-screen">
        <div ref={modalRef} className="
        bg-[#1f3735]/80 backdrop-blur-sm
          border border-[#9DD6AD]/40 shadow-xl rounded-lg
          p-5 py-3 md:py-5 w-full h-[82%] md:h-70 overflow-ellipsis"
        >
          {children}
          <p className="text-white/80 text-sm mt-3 text-center"> {t("history.msg_closeTourPop")} </p>
        </div>
      </div>
    </div>
  );
}

export function HistoryP({ t, toasterPluz }: TranslationProps) {
  const navigate = useNavigate();
  const { user, loading } = useOutletContext<{ user: User | null, loading: boolean }>();
  const [matches, setMatches] = useState<MatchMeResponse | null>(null);
  const [TourModal, setTourModal] = useState<boolean>(false);
  const [entries, setEntries] = useState<TournamentMatch | null>(null);
  const id = Number(useParams().id);
  let user_id: any;
  if (!loading)
    user_id = Number.isFinite(id) ? id : user?.acc.user_id;
  const isMe = user_id === user?.acc.user_id;

  const handleTournamentClick = (entries: TournamentMatch) => {
    setEntries(entries);
    setTourModal(true);
  };

  React.useEffect(() => {
    document.title = t("history.title");
    const loadData = async () => {
      try {
        if (!loading && user_id) {
          if (!Number.isFinite(id))
          {
            const data = await apiFetchPrivate(`match/${user_id}`, { method: "GET" });
            setMatches(data);
            return ;
          }
          else
          {
            const data = await apiFetchPrivate("my_friends", { method: "POST", body: "{}" });
            if (!data.load || !data.friends.some((f: Friends) => f.info.id === id)) {
              toasterPluz("game.ERR_trespassing");
              navigate("/", { replace: true });
              return;
            }
          }
        }
      } catch (err: any) {
        toasterPluz(err);
        return ;
      }
    };
    loadData();

  }, [loading, user_id, id]);

	return (
  <>
  {/* Background Layer */}
  <div className="absolute w-[100dvw] h-[100dvh] inset-0 -z-10 bg-cover bg-center bg-black/20 bg-[url('/pic/historyP.jpg')] bg-blend-overlay" />

  { loading ?
    <LoadingScreen progress={{step: t("loading.step_start"), completed: null, total: 1}} />
      :
    <>
    {/* History Page Content */}
      <div className="relative w-[100svw] h-[100svh] grid grid-cols-[1fr_20%] md:grid-cols-[1fr_15%] overflow-hidden">

        {/* Tournament Modal */}
        {TourModal && 
          <ExpandTourModal onClose={() => setTourModal(false)}>
            <ExpandTour entries={entries} user_id={user_id} />
          </ExpandTourModal>
        }

        {/* Left side: History Matches; exactly 5 rows */}
        <section>
        { !matches || !matches.user_matches || matches.user_matches.length === 0 ?
          <div className="flex items-center w-full h-full font-semibold">
            <div className={`${isMe ? "bg-emerald-700/50" : "bg-[#4B545B]/50"}  backdrop-blur-lg w-full h-[20%] text-center place-content-center`}>
              <p>{t("history.status_empty")}</p>
            </div>
          </div>
            :
          <HistoryList matches={matches.user_matches ?? []} user_id={user_id} onClickHandler={handleTournamentClick} />
        }
        </section>

        {/* Right side: User's profile */}
        <section className={`h-[100dvh] md:h-full flex flex-col ${isMe ? "bg-[#1f3735]/80" : "bg-[#383E69]/80" } justify-center items-center shadow-2xl`}>
          <ProfileSideBar isMe={isMe} id={user_id}/>
        </section>

      </div>
    </>
  }

  </>
  );
}

export const HistoryPage = withTranslation(HistoryP);