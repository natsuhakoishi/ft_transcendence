import type { Player } from "../../../../backend/share/type/history";
import type { PlayerWithProfileData } from "../../../../backend/share/type/Player";
import type { Winner } from "./history";
import { useLang } from "../../_hooks/language";
import { useNavigate, useOutletContext } from "react-router-dom";
import type { User } from "../../../../backend/share/type/user";

export function WinStatus ({ won } : { won: Winner }) {
  const { t } = useLang();
  const getOrdinal = (n: number) => {
    if (n === 1) return t("shared.game_stat.rank_1th");
    if (n === 2) return t("shared.game_stat.rank_2nd");
    if (n === 3) return t("shared.game_stat.rank_3rd");
    return t("shared.game_stat.rank_4th");
  };

  return (
    <span className={`relative font-bold text-base md:text-lg ${won === true || won === 1 ? 'text-golden' : 'text-silver'}`} 
      style={{ textShadow: (won || (typeof won === "number" && getOrdinal(won) === t("shared.game_stat.rank_1th")) ) ?
        '1px 1px 2px rgba(0,0,0,0.6), -1px -1px 2px rgba(255,255,255,0.7)' :
        '1px 1px 2px rgba(0,0,0,0.6), -1px -1px 2px rgba(192,192,192,0.8)', }}>
        {typeof won === "number" ? getOrdinal(won) : 
          won ? "Won" : "Lose"}
    </span>
  );
}

export function DateTime ({date,time} : { date :string, time :string}) {
  return (
    <section className="relative flex flex-col items-center justify-center font-semibold text-lg md:text-2xl text-silver">
      <span>{date}</span>
      <span className="text-base md:text-lg italic">{time}</span>
    </section>
  );
}

export function ScoreBoard({ P1, P2, won, isUser }: { P1: number; P2: number; won: Winner; isUser: number }) {
  const textShadow = '1px 1px 2px rgba(0,0,0,0.6), -1px -1px 2px rgba(255,255,255,0.7)';
  let player1Color = 'text-silver';
  let player2Color = 'text-silver';
  isUser === 1 && won ? player1Color = 'text-golden' : player2Color = 'text-golden';

  return (
    <div className="relative flex gap-1 font-bold text-xl md:text-2xl">
      <span className={`font-inter leading-[150%] ${player1Color}`} style={{ textShadow }}>{P1}</span>
        <span>:</span>
      <span className={`font-inter leading-[150%] ${player2Color}`} style={{ textShadow }}>{P2}</span>
    </div>
  );
}

export const Versus = () => {
  return (
    <p className="md:mx-2 font-bold italic md:text-lg">vs</p>
  );
}

export function PlayerInfo ({ pInfo }: { pInfo: Player | PlayerWithProfileData }) {
  const navigate = useNavigate();
  const { user } = useOutletContext<{ user: User | null }>();
  const isPlayerI = "username" in pInfo;
  const avatarURL = `${import.meta.env.VITE_API_AVATAR}${isPlayerI ? pInfo.avatar_path : pInfo.avatar}?t=${Date.now()}`;
  let isMe = false;
  if (isPlayerI)
    isMe = pInfo.username === user?.acc.username ? true : false;
  else
    isMe = pInfo.name === user?.acc.username ? true : false;
  return (
    <div className="flex flex-col items-center md:w-15 text-center">
      <div className="relative h-10 md:h-13 aspect-square flex-shrink-0">
        <button className={`aspect-square h-full rounded-full overflow-clip border-1 md:border-2 border-gray-300 ${!isMe && "cursor-pointer"}`}
          tabIndex={-1} disabled={isMe} onClick={() => !isMe && navigate(`/match_history/${isPlayerI ? pInfo.user_id : pInfo.id}`)} >
          <img className="w-full h-full object-cover" src={avatarURL} />
        </button>
        <span className={`text-sm md:text-base text-center text-gray-200 w-full ${isMe && "p-0.5 md:p-1 bg-[#9DD6AD]/80 inline-block rounded-3xl justify-center"}`}>{isPlayerI ? pInfo.username : pInfo.name}</span>
      </div>  
    </div>
  );
}

export const ModeIndicate = ({ mode }: {mode: string}) => {
  const { t } = useLang();
  const display = t(`history.mode_${mode}`);
  const isTMatch = mode === "tourMatch";

  return (
    <span className={`text-sm md:text-2xl font-bold p-2 text-center ${isTMatch && "whitespace-normal break-words w-25 md:w-auto"}`}>{display}</span>
  );
}