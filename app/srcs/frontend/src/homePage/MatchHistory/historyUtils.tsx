export function WinStatus ({ won } : { won :boolean }) {
  return (
    <span className={`${won && "text-golden"} relative text-silver font-semibold text-lg`} 
      style={{ textShadow: won ?
        '1px 1px 2px rgba(0,0,0,0.6), -1px -1px 2px rgba(255,215,0,0.8)'  :
        '1px 1px 2px rgba(0,0,0,0.6), -1px -1px 2px rgba(192,192,192,0.8)', }}>
        {won ? "Won" : "Lose"}
    </span>
  );
}

export function DateTime ({date,time} : { date :string, time :string}) {
  return (
    <section className="relative flex flex-col items-center justify-center font-semibold text-lg text-silver">
      <span>{date}</span>
      <span>{time}</span>
    </section>
  );
}

export function ScoreBoard({ P1, P2, won }: { P1: number; P2: number; won: boolean }) {
  const textShadow = '1px 1px 2px rgba(0,0,0,0.6), -1px -1px 2px rgba(255,255,255,0.7)';
  const player1Color = won ? 'text-golden' : 'text-silver';
  const player2Color = won ? 'text-silver' : 'text-golden';

  return (
    <div className="relative flex gap-1 font-inter font-bold leading-[150%]" style={{ textShadow }}>
      <span className={player1Color}>{P1}</span>
        <span>:</span>
      <span className={player2Color}>{P2}</span>
    </div>
  );
}

export const Versus = () => {
  return (
    <p className="font-semibold">vs</p>
  );
}

export function PlayerInfo ({name} : { name: string }) {
  const avatarURL = `${import.meta.env.VITE_API_AVATAR}/default.webp?t=${Date.now()}`;
  //todo actually fetch user's avatar
  //todo a lightweight api that return {avatar}; or you know what? implement them in /match/me
  
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
