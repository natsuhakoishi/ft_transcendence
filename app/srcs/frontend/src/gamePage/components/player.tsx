import type { PlayerWithProfileData } from "../../../../backend/share/type/Player";

export function Player({ player, me, spin, small, txtSmall}: { player?: PlayerWithProfileData, me: boolean, spin?: boolean, small?: boolean, txtSmall?: boolean}) {

    return (
        <div
            className={`
                flex flex-col 
                ${small ? "scale-70" : ""}
                items-center md:gap-2
            `}
        >
            <img
                draggable={false}
                src={import.meta.env.VITE_API_AVATAR + player?.avatar}
                alt={player?.name}
                className={`
                    rounded-full border aspect-square w-25 md:w-auto
                    ${spin ? "animate-spin" : ""}
                `}
            />
            <h1
                className={`
                    ${txtSmall ? "text-base md:text-lg" : "text-2xl md:text-4xl"}
                    text-black-500
                    font-bold mb-2
                    ${me ? "bg-green-100" : ""}
                `}
            > {player?.name}</h1>
        </div>
    );
}