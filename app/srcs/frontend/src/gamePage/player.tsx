import type { PlayerWithProfileData } from "../../../backend/share/type/Player";

export function Player({ player, me, spin}: { player?: PlayerWithProfileData, me: boolean, spin?: boolean}) {

    return (
        <div className="flex flex-col items-center gap-2">
            <img
                src={import.meta.env.VITE_API_AVATAR + player?.avatar}
                alt={player?.name}
                className={`rounded-full border ${spin ? "animate-spin" : ""}`}
                // className="rounded-full border"
            />
            <h1 className={`text-4xl text-black-500 font-bold mb-2 ${me ? "bg-green-100" : ""}`} > {player?.name}</h1>
        </div>
    );
}