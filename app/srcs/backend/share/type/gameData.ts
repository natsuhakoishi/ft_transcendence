import type { Matches } from "./tournamentRoomData.ts";

export interface GameData {
    roomId: string;

    playerId: number;
    keyPress: string;
}

export interface TData {
    round1: Matches;
    round2?: Matches;

}