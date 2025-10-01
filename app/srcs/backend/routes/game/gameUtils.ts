import { getProfileById } from "../../database/profile.ts";
import type { TData } from "../../share/type/gameData.ts";
import type { GameState } from "../../share/type/gameState.ts";
import type { Player, PlayerWithProfileData } from "../../share/type/Player.ts";

export function Trespassing(ws: any): void {
    console.log("/gameplay(ws): player trespassing");
    ws.send(JSON.stringify({type: "trespassing" , gameState: initGameState()}));
}

export function resetBall(state: GameState): void {
    const boardWidth: number = 900;
    const boardHeight: number = 500;
    const paddlesWidth: number = 10;
    const paddlesHeight: number = 200;

    state.ball.x = boardWidth / 2;
    state.ball.y = boardHeight / 2;
    state.ball.vx = 4;
    state.ball.vy = 4;
    state.ball.radius = 10;
    state.leftPaddle.x = 20;
    state.leftPaddle.y = boardHeight / 2 - paddlesHeight / 2;
    state.rightPaddle.x = boardWidth - paddlesWidth - 10;
    state.rightPaddle.y = boardHeight / 2 - paddlesHeight / 2;

    // state.ball.x = 450;
    // state.ball.y = 250;
    // state.ball.vx = 4;
    // state.ball.vy = 4;
    // state.ball.radius = 10;
    // state.leftPaddle.x = 20;
    // state.leftPaddle.y = 150
    // state.rightPaddle.x = 880;
    // state.rightPaddle.y = 150;
}

export function initGameState(): GameState {
    const boardWidth: number = 900;
    const boardHeight: number = 500;
    const paddlesHeight: number = 200;
    const paddlesWidth: number = 10;

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
            }
        };
        return data;
}

async function  getPlayerData(_id: number): Promise<PlayerWithProfileData> {
    try {
        const data = await getProfileById(_id);
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
        state: _state
    }

    return data;
}