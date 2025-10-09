import type { Player } from "../../../../backend/share/type/history";
import type { PlayerWithProfileData } from "../../../../backend/share/type/Player";
import type { Winner } from "./history";

export function WinStatus ({ won } : { won: Winner }) {
  const getOrdinal = (n: number) => {
    if (n === 1) return "1st";
    if (n === 2) return "2nd";
    if (n === 3) return "3rd";
    return "4th";
  };

  return (
    <span className={` relative font-semibold text-lg ${won === true || won === 1 ? 'text-golden' : 'text-silver'}`} 
      style={{ textShadow: won ?
        '1px 1px 2px rgba(0,0,0,0.6), -1px -1px 2px rgba(255,255,255,0.7)' :
        '1px 1px 2px rgba(0,0,0,0.6), -1px -1px 2px rgba(192,192,192,0.8)', }}>
        {typeof won === "number" ? getOrdinal(won) : 
          won ? "Won" : "Lose"}
    </span>
  );
}

export function DateTime ({date,time} : { date :string, time :string}) {
  return (
    <section className="relative flex flex-col items-center justify-center font-semibold text-lg text-silver">
      <span>{date}</span>
      <span className="text-sm">{time}</span>
    </section>
  );
}

export function ScoreBoard({ P1, P2, won }: { P1: number; P2: number; won: Winner }) {
  const textShadow = '1px 1px 2px rgba(0,0,0,0.6), -1px -1px 2px rgba(255,255,255,0.7)';
  const player1Color = won ? 'text-golden' : 'text-silver';
  const player2Color = won ? 'text-silver' : 'text-golden';

  return (
    <div className="relative flex gap-1 font-bold">
      <span className={`font-inter leading-[150%] ${player1Color}`} style={{ textShadow }}>{P1}</span>
        <span className="">:</span>
      <span className={`font-inter leading-[150%] ${player2Color}`} style={{ textShadow }}>{P2}</span>
    </div>
  );
}

export const Versus = () => {
  return (
    <p className="mx-2 font-semibold">vs</p>
  );
}

export function PlayerInfo ({ pInfo }: { pInfo: Player | PlayerWithProfileData }) {
  const isPlayer = "username" in pInfo;
  const avatarURL = `${import.meta.env.VITE_API_AVATAR}${isPlayer ? pInfo.avatar_path : pInfo.avatar}?t=${Date.now()}`;
  
  return (
    <div className="flex flex-col items-center w-15 text-center">
      <div className="relative h-13 aspect-square flex-shrink-0">
        <button className="aspect-square h-full rounded-full overflow-clip border-2 border-gray-300 disable" tabIndex={-1}>
          <img className="w-full h-full object-cover" src={avatarURL} />
        </button>
        <p className="mt-1 text-sm text-center text-gray-200 truncate w-full">{isPlayer ? pInfo.username : pInfo.name}</p>
      </div>
    </div>
  );
}
