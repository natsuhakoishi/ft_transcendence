import type { Matches } from "./Matches";

export interface GameData {
    roomId: string;

    playerId: number;
    keyPress: string;
    tournament: boolean;
}

export interface TData {
    round1: Matches;
    round2: Matches;
}