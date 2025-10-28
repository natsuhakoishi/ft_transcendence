import type { PlayerWithProfileData } from "../../../backend/share/type/Player";

export function Player({ player, me, spin, small}: { player?: PlayerWithProfileData, me: boolean, spin?: boolean, small?: boolean}) {

    return (
        <div
            className={`
                flex flex-col 
                ${small ? "scale-70" : ""}
                items-center gap-2
            `}
        >
            <img
                src={import.meta.env.VITE_API_AVATAR + player?.avatar}
                alt={player?.name}
                className={`
                    rounded-full border
                    ${spin ? "animate-spin" : ""}
                `}
            />
            <h1
                className={`
                    text-4xl text-black-500
                    font-bold mb-2
                    ${me ? "bg-green-100" : ""}
                `}
            > {player?.name}</h1>
        </div>
    );
}