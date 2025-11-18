import type { Matches, MatchPlayersData } from "./Matches";
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

export interface LocalGameData extends GameData {
    playerName: string;
}

export interface localTData {
    round1: MatchPlayersData[];
    round2: MatchPlayersData[];

    state: null | "r1" | "r2";
    matchCount: number;
    matches: Record<number, MatchPlayersData>; //1,2,3,4 round for each match

    players: Record<string, PlayerWithProfileData>;
    leaderboard?: Leaderboard;
}