import type { GameState } from "./gameState.ts";

export interface GameData {
    roomId: string;

    playerId: number;
    keyPress: string;
    gameState: GameState;
}

export interface TGameData {
    roomId: string;

    playerId: number;
    keyPress: string;
}