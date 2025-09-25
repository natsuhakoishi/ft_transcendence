import type { Matches } from "./Matches";
import { Player, PlayerWithProfileData } from "./Player";

export interface GameData {
    roomId: string;

    playerId: number;
    keyPress: string;
    tournament: boolean;
}

export interface TData {
    round1: Matches;
    round2: Matches;
    players: Record<string, PlayerWithProfileData>;
    state?: "r1" | "r2";
}