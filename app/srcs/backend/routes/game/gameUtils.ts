import { randomInt } from "crypto";
import { getProfileById } from "../../database/profile.ts";
import { GAME_BALL_RADIUS_PX, GAME_BALL_VX_PX, GAME_BALL_VY_PX, GAME_BOARD_HEIGHT_PX, GAME_BOARD_WIDTH_PX, GAME_PADDLES_HEIGHT_PX, GAME_PADDLES_MARGIN_PX, GAME_PADDLES_WIDTH_PX } from "../../server.ts";
import type { Profile } from "../../share/type/db_ProfileData.ts";
import type { localTData, TData } from "../../share/type/gameData.ts";
import type { GameState } from "../../share/type/gameState.ts";
import type { Player, PlayerWithProfileData } from "../../share/type/Player.ts";
import type { Leaderboard } from "../../share/type/tournamentRoomData.ts";

export function Trespassing(ws: any): void {
    console.log("/gameplay(ws): player trespassing");
    ws.send(JSON.stringify({type: "trespassing" , gameState: initGameState()}));
}

export function resetBall(state: GameState): void {
    const boardWidth: number = parseInt(GAME_BOARD_WIDTH_PX!);
    const boardHeight: number = parseInt(GAME_BOARD_HEIGHT_PX!);;
    const paddlesHeight: number = parseInt(GAME_PADDLES_HEIGHT_PX!);
    const paddlesWidth: number = parseInt(GAME_PADDLES_WIDTH_PX!);
    const paddlesMargin: number = parseInt(GAME_PADDLES_MARGIN_PX!);
    const ballRadius: number = parseInt(GAME_BALL_RADIUS_PX!);
    const ballVY: number = parseInt(GAME_BALL_VY_PX!);
    const ballVX: number = parseInt(GAME_BALL_VX_PX!);

    state.ball.x = boardWidth / 2;
    state.ball.y = boardHeight / 2;

    state.ball.vy = ballVY;
    state.ball.vx = ballVX;
    if (randomInt(100) % 2 === 0)
    {
        state.ball.vy *= -1;
        state.ball.vx *= -1;
    }

    state.ball.radius = ballRadius;
    state.leftPaddle.x = paddlesMargin;
    state.leftPaddle.y = boardHeight / 2 - paddlesHeight / 2;
    state.rightPaddle.x = boardWidth - paddlesWidth - paddlesMargin;
    state.rightPaddle.y = boardHeight / 2 - paddlesHeight / 2;
}

export function initGameState(): GameState {
    const boardWidth: number = parseInt(GAME_BOARD_WIDTH_PX!);
    const boardHeight: number = parseInt(GAME_BOARD_HEIGHT_PX!);;
    const paddlesHeight: number = parseInt(GAME_PADDLES_HEIGHT_PX!);
    const paddlesWidth: number = parseInt(GAME_PADDLES_WIDTH_PX!);
    const paddlesMargin: number = parseInt(GAME_PADDLES_MARGIN_PX!);

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
    return data;
}

export function createRoomID(p1: number, p2: number): string {
    return p1 > p2 ? `${p2}-${p1}` : `${p1}-${p2}`;
}

export function createTRoomID(playerID: [number, number, number, number]): string {
    playerID.sort();
    return `${playerID[0]}-${playerID[1]}-${playerID[2]}-${playerID[3]}`;
}

export async function initTData(playerID: [number, number, number, number]): Promise<TData> {
    const data: TData = {
        round1: {
            roomID: [],
            matches: [[], []]
        },
        round2: {
            roomID: [],
            matches: [[], []]
        },
        players: {
            [playerID[0].toString()] : await getPlayerData(playerID[0]),
            [playerID[1].toString()] : await getPlayerData(playerID[1]),
            [playerID[2].toString()] : await getPlayerData(playerID[2]),
            [playerID[3].toString()] : await getPlayerData(playerID[3]),
        },
        leaderboard: initLeaderboard()
    };
    return data;
}

export function initLocalTData(players: PlayerWithProfileData[]): localTData {
    const data: localTData = {
        round1: [],
        round2: [],
        state: null,

        matchCount: 0,
        matches: {},

        players: {
            [players[0].name!.toString()] : players[0],
            [players[1].name!.toString()] : players[1],
            [players[2].name!.toString()] : players[2],
            [players[3].name!.toString()] : players[3],
        },
        leaderboard: initLeaderboard()
    };
    return data;
}

async function  getPlayerData(_id: number): Promise<PlayerWithProfileData> {
    try {
        const data: Profile = await getProfileById(_id);
        return {id: data.id, name: data.username, avatar: data.avatar_path};
    }
    catch (e) {
        console.log(e);
        return {id: 0, name: "no",avatar: "idk"};
    }
}

export function TDataWithOutWS(_data: TData, _state?: "r1" | "r2"): TData {
    const sortPlayer = (match: Player[]): Player[] => {
        if (match[0].id > match[1].id)
            return [match[1], match[0]];
        return match;
    };

    const data: TData = {
        round1: {
            roomID: _data.round1.roomID,
            matches: [
                sortPlayer(
                    [
                        {id: _data.round1.matches[0][0].id},
                        {id: _data.round1.matches[0][1].id}
                    ]
                ),
                sortPlayer(
                    [
                        {id: _data.round1.matches[1][0].id},
                        {id: _data.round1.matches[1][1].id}
                    ]
                ),
            ]
        },
        round2: {
            roomID: _data.round2.roomID,
            matches: [
                sortPlayer(
                    [
                        {id: _data.round2.matches[0][0]?.id},
                        {id: _data.round2.matches[0][1]?.id}
                    ]
                ),
                sortPlayer(
                    [
                        {id: _data.round2.matches[1][0]?.id},
                        {id: _data.round2.matches[1][1]?.id}
                    ]
                ),
            ]
        },
        players: _data.players,
        state: _state,
        leaderboard: _data.leaderboard
    }

    return data;
}

export function initLeaderboard(): Leaderboard {
    return {
        first: {id: 0},
        second: {id: 0},
        third: {id: 0},
        last: {id: 0}
    };
}