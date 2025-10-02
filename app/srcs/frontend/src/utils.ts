import type { GameData } from "../../backend/share/type/gameData";
import type { GameState } from "../../backend/share/type/gameState";

export function initGameState(): GameState {
  const boardWidth: number = Number(import.meta.env.VITE_GAME_BOARD_WIDTH_PX);
  const boardHeight: number = Number(import.meta.env.VITE_GAME_BOARD_HEIGHT_PX);
  const paddlesHeight: number = Number(import.meta.env.VITE_GAME_PADDLES_HEIGHT_PX);
  const paddlesWidth: number = Number(import.meta.env.VITE_GAME_PADDLES_WIDTH_PX);

  const data: GameState = {
                 //init default position and board size
                ball: { x: boardWidth / 2, y: boardHeight / 2, vx: 4, vy: 4, radius: 10},
                leftPaddle: { x: 20, y: boardHeight / 2 - paddlesHeight / 2, width: paddlesWidth, height: paddlesHeight},
                rightPaddle: { x: boardWidth - paddlesWidth - 10, y: boardHeight / 2 - paddlesHeight / 2, width: paddlesWidth, height: paddlesHeight},
                boardHeight: boardHeight,
                boardWidth: boardWidth,
                gamingStage: false,
                playerOffline: false,
                score: {
                    p1Score: 0,
                    p2Score: 0
                }
            };
    // console.log(JSON.stringify(data, null, 2));
    return data;
}


export function initGameData(_roomId: string, _playerID: number): GameData {
    const data: GameData = {
                roomId: _roomId,
                playerId: _playerID,
                keyPress: "//init//",
                tournament: false
            };
    return data;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string> || {}) };
  if (!(options.body instanceof FormData))
    headers["Content-Type"] = "application/json";

  const res = await fetch(`https://localhost:4242/api/${endpoint}`, { ...options, headers, credentials: 'include' });
  const data = await res.json();

  if (!res.ok)
    throw new Error(data.message);

  return data;
}

let onUnauthorized: (() => void) | null = null;

export function  setUnauthorized(callback: () => void) {
  onUnauthorized = callback;
}

  export async function apiFetchPrivate(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = { ...(options.headers as Record<string, string> || {}) };
    if (!(options.body instanceof FormData))
      headers["Content-Type"] = "application/json";

    const res = await fetch(`https://localhost:4242/api/private/${endpoint}`, { ...options, headers, credentials: 'include' });
    const data = await res.json();

    if (res.status === 401)
    {
      if (onUnauthorized)
        onUnauthorized();
      throw { status: 401, message: "Unauthorized!" };
    }
    else if (!res.ok)
      throw { status: res.status, message: data.message };

    return data;
  }
