import type { GameData } from "../../backend/share/type/gameData";
import type { GameState } from "../../backend/share/type/gameState";
import type { PlayerWithProfileData } from "../../backend/share/type/Player";
import type { User } from "../../backend/share/type/user";

export function initGameState(): GameState {
	const boardWidth: number = Number(import.meta.env.VITE_GAME_BOARD_WIDTH_PX);
	const boardHeight: number = Number(import.meta.env.VITE_GAME_BOARD_HEIGHT_PX);
	const paddlesHeight: number = Number(import.meta.env.VITE_GAME_PADDLES_HEIGHT_PX);
	const paddlesWidth: number = Number(import.meta.env.VITE_GAME_PADDLES_WIDTH_PX);
	const paddlesMargin: number = Number(import.meta.env.VITE_GAME_PADDLES_MARGIN_PX);;

	const data: GameState = {
				//init default position and board size
			ball: { x: boardWidth / 2, y: boardHeight / 2, vx: 4, vy: 4, radius: 10},
			leftPaddle: { x: paddlesMargin, y: boardHeight / 2 - paddlesHeight / 2, vy: 0, width: paddlesWidth, height: paddlesHeight},
			rightPaddle: { x: boardWidth - paddlesWidth - paddlesMargin, y: boardHeight / 2 - paddlesHeight / 2, vy: 0, width: paddlesWidth, height: paddlesHeight},
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

  const res = await fetch(`${import.meta.env.VITE_API_FETCH}${endpoint}`, { ...options, headers, credentials: 'include' });
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

	const res = await fetch(`${import.meta.env.VITE_API_PRI_FETCH}${endpoint}`, { ...options, headers, credentials: 'include' });
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

export async function sendProfile(ws: WebSocket, callback: () => void): Promise<void> {
	try {
		const data: User = await apiFetchPrivate("profile", { method: "POST", body: "{}" });

		const id: number = data.acc.user_id;
		const avatar: string = data.profile.avatar_path!;
		const name: string = data.acc.username;

		const PlayerData: PlayerWithProfileData = {
			id: id,
			name: name,
			avatar: avatar
		};
		ws.send(JSON.stringify(PlayerData));
		console.log("sent data", PlayerData);
	}
	catch (e) {
		console.log("Matching: fetch error: ", e);
		callback();
	}
}