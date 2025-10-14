import type { Matches } from "./Matches";
import type { PlayerWithProfileData } from "./Player";
import type { Leaderboard } from "./tournamentRoomData";

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
    leaderboard?: Leaderboard;
}