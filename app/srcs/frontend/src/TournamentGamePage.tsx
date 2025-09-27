import React from "react";
import { GamePage } from "./gamePage";
import { data, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { apiFetchPrivate } from "./utils";
import type { GameData, TData } from "../../backend/share/type/gameData";
import type { Matches } from "../../backend/share/type/Matches";
import NotFound from "./NotFound";
import type { PlayerWithProfileData } from "../../backend/share/type/Player";
import { LoadingScreen } from "./mainPage";

interface LoadingProps {
  leaderboard?: {
    matches: Matches;
    players: Record<string, PlayerWithProfileData>;
  };
  load: boolean;
  playerID?: string;
}

function Loading({ leaderboard, load, playerID }: LoadingProps) {
    if (load || !leaderboard)
        return <LoadingScreen />

    const { matches, players } = leaderboard;

    console.log("Loading: " + playerID, leaderboard, playerID);

    return (
        <div className="flex flex-col gap-8">
        {matches.matches.map((match, idx) => {
            const [p1, p2] = match;
            const player1: PlayerWithProfileData = players[p1.id.toString()];
            const player2: PlayerWithProfileData = players[p2.id.toString()];

            return (
            <div key={idx} className="flex items-center gap-4">
                {/* Player 1 */}
                <div className="flex items-center gap-2">
                <img
                    src={import.meta.env.VITE_AVATAR_ROUTE + player1?.avatar}
                    alt={player1?.name}
                    className="w-8 h-8 rounded-full border"
                />
                <span
                    className={`font-medium ${
                    player1?.id.toString() === playerID ? "text-blue-600" : ""
                    }`}
                >
                    {player1?.name}
                </span>
                </div>

                <span className="font-bold">VS</span>

                {/* Player 2 */}
                <div className="flex items-center gap-2">
                <img
                    src={import.meta.env.VITE_AVATAR_ROUTE + player2?.avatar}
                    alt={player2?.name}
                    className="w-8 h-8 rounded-full border"
                />
                <span
                    className={`font-medium ${
                    player2?.id.toString() === playerID ? "text-blue-600" : ""
                    }`}
                >
                    {player2?.name}
                </span>
                </div>
            </div>
            );
        })}
    </div>
  );
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
        players: Record<string, PlayerWithProfileData>
    }>();

    React.useEffect(() => {
        ( async () => {
            console.log("TournamentGamePage: useEffect");
            if (!tournamentRoomID)
            {
                console.log("TournamentGamePage: Trespassing ^u^b");
                navigate(import.meta.env.VITE_PATH_404NOTFOUND);
            }
            // setTRoomID(tournamentRoomID);

            let playerID: string;
            try {
                const data = await apiFetchPrivate("me", { method: "GET" })
                playerID = data.id;
            }
            catch (e) {
                console.log("FlowPage: trespassing");
                navigate(import.meta.env.VITE_PATH_404NOTFOUND);
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
                    navigate(import.meta.env.VITE_PATH_404NOTFOUND);
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
                        navigate(import.meta.env.VITE_PATH_TOURNAMENT_GAMEPLAY, { state: {RoomID: r1.roomID[0], isTournament: true, TROOMID: tournamentRoomID} })
                        : navigate(import.meta.env.VITE_PATH_TOURNAMENT_GAMEPLAY, { state: {RoomID: r1.roomID[1], isTournament: true, TROOMID: tournamentRoomID} });
                }
                else if (type === "startRound2")
                {
                    console.log("TournamentGamePage: round2");
                    const r2: Matches = parse.state.round2;
                    const rooms: string[] = r2.roomID[0].split("-");
                    rooms.includes(playerID.toString()) ?
                        navigate(import.meta.env.VITE_PATH_TOURNAMENT_GAMEPLAY, { state: {RoomID: r2.roomID[0], isTournament: true, TROOMID: tournamentRoomID} })
                        : navigate(import.meta.env.VITE_PATH_TOURNAMENT_GAMEPLAY, { state: {RoomID: r2.roomID[1], isTournament: true, TROOMID: tournamentRoomID} });
                }
                else if (type === "end")
                {
                    console.log("TournamentGamePage: end");
                    setLoad(false);
                    ws.close();
                }
            }

        })();

        return () => { //when user press 'back button'
            console.log("TournamentGamePage: closing ws");
            wsRef.current?.close();
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
            <Route path="/" element={<Loading leaderboard={leaderboard} load={load} playerID={gameDataRef.current.playerId.toString()} />} />
            <Route
                path="gameplay"
                element={<GamePage onGameOver={handleGameOver} />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}