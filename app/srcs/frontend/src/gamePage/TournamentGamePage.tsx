import React from "react";
import { GamePage } from "./gamePage";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { apiFetchPrivate } from "../utils";
import type { GameData, TData } from "../../../backend/share/type/gameData";
import type { Matches, MatchPlayersData } from "../../../backend/share/type/Matches";
import type { Player, PlayerWithProfileData } from "../../../backend/share/type/Player";
import { TournamentLoading } from "./TournamentLoadingPage";
import { TournamentResultPage } from "./ResultPage";
import toast from "react-hot-toast";

function createMAtchPlayersData(roomID: string, players: Record<string, PlayerWithProfileData>, match: Player[]): MatchPlayersData {
    const p1: Player = match[0];
    const p2: Player = match[1];

    return {roomID: roomID, Players: [players[p1.id], players[p2.id]]};
}

export function TournamentGamePage() {
    let init: boolean = false;
    const navigate = useNavigate();
    const [load, setLoad] = React.useState(true);
    const location = useLocation();
    const { tournamentRoomID } = (location.state || {}) as {tournamentRoomID?: string};
    const wsRef = React.useRef<WebSocket | null>(null);
    const gameDataRef = React.useRef<GameData>({
        roomId: "",
        playerId: 0,
        keyPress: "init",
        tournament: true,
    });
    const [leaderboard, setLeaderboard] = React.useState<{
        matches: Matches,
        players: Record<string, PlayerWithProfileData> //id : PlayerData
    }>();

    React.useEffect(() => {
        ( async () => {
            console.log("TournamentGamePage: useEffect");
            if (!tournamentRoomID)
            {
                console.log("TournamentGamePage: Trespassing ^u^b");
                // navigate(import.meta.env.VITE_PATH_404NOTFOUND);
                navigate(import.meta.env.VITE_PATH_404NOTFOUND, { state: {msg: "A"}});
            }
            // setTRoomID(tournamentRoomID);

            let playerID: string;
            try {
                const data = await apiFetchPrivate("me", { method: "GET" })
                playerID = data.id;
            }
            catch (e) {
                console.log("FlowPage: trespassing");
                navigate(import.meta.env.VITE_PATH_404NOTFOUND, { state: {msg: "B"}});
                // navigate(import.meta.env.VITE_PATH_404NOTFOUND);
            }

            console.log("TournamentGamePage", playerID!);
            const ws: WebSocket = new WebSocket(import.meta.env.VITE_GAME_TOURNAMENT_GAMEPLAY_ROUTE!);
            wsRef.current = ws;

            gameDataRef.current.roomId = tournamentRoomID!;
            gameDataRef.current.playerId = parseInt(playerID!);

            ws.onopen = () => {
                if (!init)
                {
                    console.log("TournamentGamePage: init");
                    ws.send(JSON.stringify(gameDataRef.current));
                    init = true;
                }
            }

            ws.onmessage = (msg) => {
                const parse: { type: string, state: TData} = JSON.parse(msg.data);
                const type: string = parse.type;
                console.log("TournamentGamePage: rev msg", parse);

                if (type === "trespassing")
                {
                    console.log("TournamentGamePage ws.onmessage: Trespassing ^u^b");
                    navigate(import.meta.env.VITE_PATH_404NOTFOUND, { state: {msg: "C"}});
                    // navigate(import.meta.env.VITE_PATH_404NOTFOUND);
                }
                else if (type === "update")
                {
                    if (parse.state.state === "r1")
                        setLeaderboard({
                            matches: parse.state.round1,
                            players: parse.state.players,
                        });
                    else
                        setLeaderboard({
                            matches: parse.state.round2,
                            players: parse.state.players,
                        });
                    console.log("TournamentGamePage: setLoad to false", parse.state);
                    setLoad(false);
                }
                else if (type === "startRound1")
                {
                    console.log("TournamentGamePage: round1");
                    const r1: Matches = parse.state.round1;
                    const rooms: string[] = r1.roomID[0].split("-");
                    rooms.includes(playerID.toString()) ?
                        navigate(import.meta.env.VITE_PATH_TOURNAMENT_GAMEPLAY, { state: {RoomID: r1.roomID[0], isTournament: true, TROOMID: tournamentRoomID, playersData: createMAtchPlayersData(r1.roomID[0], parse.state.players, r1.matches[0])} })
                        : navigate(import.meta.env.VITE_PATH_TOURNAMENT_GAMEPLAY, { state: {RoomID: r1.roomID[1], isTournament: true, TROOMID: tournamentRoomID, playersData: createMAtchPlayersData(r1.roomID[1], parse.state.players, r1.matches[1])} });
                }
                else if (type === "startRound2")
                {
                    console.log("TournamentGamePage: round2");
                    const r2: Matches = parse.state.round2;
                    const rooms: string[] = r2.roomID[0].split("-");
                    rooms.includes(playerID.toString()) ?
                        navigate(import.meta.env.VITE_PATH_TOURNAMENT_GAMEPLAY, { state: {RoomID: r2.roomID[0], isTournament: true, TROOMID: tournamentRoomID, playersData: createMAtchPlayersData(r2.roomID[0], parse.state.players, r2.matches[0])} })
                        : navigate(import.meta.env.VITE_PATH_TOURNAMENT_GAMEPLAY, { state: {RoomID: r2.roomID[1], isTournament: true, TROOMID: tournamentRoomID, playersData: createMAtchPlayersData(r2.roomID[1], parse.state.players, r2.matches[1])} });
                }
                else if (type === "end")
                {
                    console.log("TournamentGamePage: end");
                    console.log("TournamentGamePage: leaderboard: ", parse);
                    setTimeout(() => {
                        console.log("TournamentGamePage: to:", import.meta.env.VITE_PATH_TOURNAMENT_RESULT);
                        navigate(import.meta.env.VITE_PATH_TOURNAMENT_RESULT, { state: {leaderboard: parse.state.leaderboard, playerID: playerID}});
                    }, 1000 * 4);
                }
                else if (type === "offline")
                {
                    console.log("TournamentGamePage: player offline");
                    toast.error("Opponent offline");
                    toast.error("Tournament cancel");
                    console.log("TournamentGamePage: redirect to home");
                    navigate("/");
                }
            }

        })();

        return () => { //when user press 'back button'
            console.log("TournamentGamePage: closing ws");
            wsRef.current?.close();
            wsRef.current = null;
            gameDataRef.current = {
                roomId: "",
                playerId: 0,
                keyPress: "init",
                tournament: true,
            };
        };

    }, []);

    const handleGameOver = () => {
        console.log("TournamentGamePage: handleGameOver");
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            setLoad(true);
            gameDataRef.current.keyPress = "over";
            console.log("TournamentGamePage: handleGameOver: ", gameDataRef.current);
            wsRef.current.send(JSON.stringify(gameDataRef.current));
        }
    }

    return (
        <Routes>
            <Route path="/" element={<TournamentLoading leaderboard={leaderboard} load={load} playerID={gameDataRef.current.playerId.toString()} />} />
            <Route
                path="gameplay"
                element={<GamePage onGameOver={handleGameOver} />} />
            <Route path="result" element={<TournamentResultPage />} />
            {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
    );
}
