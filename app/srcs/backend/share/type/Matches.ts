import type { Player } from "./Player.ts";

export interface Matches {
    roomID: string[];
    // type: null | "started" | "ended";
    matches: [
        Player[],
        Player[]
    ];
}