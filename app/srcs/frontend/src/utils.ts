import toast from "react-hot-toast";
import type { GameData } from "../../backend/share/type/gameData";
import type { GameState } from "../../backend/share/type/gameState";
import type { PlayerWithProfileData } from "../../backend/share/type/Player";
import type { User } from "../../backend/share/type/user";
import { getGlobalErrorHandler } from "./_hooks/error";

export function isMobile(): boolean {
	return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
	.test(navigator.userAgent);
}

export function initGameState(): GameState {
	const boardWidth: number = Number(import.meta.env.VITE_GAME_BOARD_WIDTH_PX);
	const boardHeight: number = Number(import.meta.env.VITE_GAME_BOARD_HEIGHT_PX);
	const paddlesHeight: number = Number(import.meta.env.VITE_GAME_PADDLES_HEIGHT_PX);
	const paddlesWidth: number = Number(import.meta.env.VITE_GAME_PADDLES_WIDTH_PX);
	const paddlesMargin: number = Number(import.meta.env.VITE_GAME_PADDLES_MARGIN_PX);
	const ballRadius: number = Number(import.meta.env.VITE_GAME_BALL_RADIUS_PX);
	const ballVX: number = Number(import.meta.env.VITE_GAME_BALL_VX_PX);
	const ballVY: number = Number(import.meta.env.VITE_GAME_BALL_VY_PX);

	const data: GameState = {
				//init default position and board size
			ball: { x: boardWidth / 2, y: boardHeight / 2, vx: ballVX, vy: ballVY, radius: ballRadius},
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

  	try
	{
		const res = await fetch(`${import.meta.env.VITE_API_FETCH}${endpoint}`, { ...options, headers, credentials: 'include' });
		let data: any = {};
		data = await res.json();

		if (!res.ok)
    	{
			if (res.status === 401) getGlobalErrorHandler("401")();
			if (res.status === 404) getGlobalErrorHandler("404")();

			throw { status: res.status, code: data.code, message: data.message };
		}
		return data;

	} catch (err: any) {
		if (err instanceof TypeError && err.message.includes('Failed to fetch'))
		{
			console.error("Server/Network Error\n", err);
			getGlobalErrorHandler("503")();
			throw { status: 503, message: "Server/Network Error" };
		}
		console.error(`API Error: ${err.message}`,`[Status: ${err.status}]`);
		throw err;
	}
}

export async function apiFetchPrivate(endpoint: string, options: RequestInit = {}) {
	const headers: Record<string, string> = { ...(options.headers as Record<string, string> || {}) };
	if (!(options.body instanceof FormData))
		headers["Content-Type"] = "application/json";

	try
	{
		const res = await fetch(`${import.meta.env.VITE_API_PRI_FETCH}${endpoint}`, { ...options, headers, credentials: 'include' });
		let data: any = {};
		data = await res.json();

		if (!res.ok)
		{
			if (res.status === 401) getGlobalErrorHandler("401")();
			if (res.status === 404) getGlobalErrorHandler("404")();

			throw { status: res.status, code: data.code, message: data.message };
		}
		return data;

	} catch (err: any) {
		if (err instanceof TypeError && err.message.includes('Failed to fetch'))
		{
			console.error("Server/Network Error\n", err);
			getGlobalErrorHandler("503")();
			throw { status: 503, message: "Server/Network Error" };
		}
		console.error(`API Error: ${err.message}`,`[Status: ${err.status}]`);
		throw err;
	}
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

//todo 503 error message should use hook

export function bakery(t: (key: string) => string) {
  return (err: any) => {
	const key = typeof err === "string" || typeof err === "number" ? `pop.${String(err)}` : 
		( err?.code ? `pop.${err.code}` :
			( err?.status ? `pop.${String(err.status)}` : "pop.ERR_SWR" ));

	// console.log(key);
	const shortKey = key.split(".").pop() || key;
    const msg = t(key);
	let isStatus: boolean = false;
	if (Number(shortKey) >= 400 && Number(shortKey) <= 599)
		isStatus = true;

    if (isStatus || shortKey.startsWith("ERR_")) return toast.error(msg);
    if (shortKey.startsWith("OK_")) return toast.success(msg);

    return toast(msg);
  };
}