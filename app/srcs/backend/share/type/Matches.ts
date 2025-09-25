import type { Player } from "./Player.ts";

export interface Matches {
    roomID: string[];
    matches: [
        Player[],
        Player[]
    ];
}