import type { PlayerWithProfileData } from "../../../backend/share/type/Player";

export function Player({ player, me }: { player?: PlayerWithProfileData, me: boolean}) {

    return (
        <div className="flex flex-col items-center">
            <img src={import.meta.env.VITE_AVATAR_ROUTE + player?.avatar}></img>
            <h1 className={`text-4xl text-black-500 font-bold mb-2 ${me ? "bg-green-100" : ""}`} > {player?.name}</h1>
        </div>
    );
}