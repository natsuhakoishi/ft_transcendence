import type { Player, PlayerWithProfileData } from "./Player.ts";

export interface MatchPlayersData {
    roomID: string;
    Players: PlayerWithProfileData[];
}

export interface Matches {
    roomID: string[];
    matches: [
        Player[],
        Player[]
    ];
}
