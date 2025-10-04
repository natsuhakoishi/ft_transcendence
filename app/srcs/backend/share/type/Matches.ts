import type { Player, PlayerWithProfileData } from "./Player.ts";

export interface Matches {
    roomID: string[];
    matches: [
        Player[],
        Player[]
    ];
}

export interface MatchPlayersData {
    roomID: string;
    Players: PlayerWithProfileData[];
}