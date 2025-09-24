import React from "react";
import { GamePage } from "./gamePage";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { apiFetchPrivate } from "./utils";
import type { GameData, TData } from "../../backend/share/type/gameData";
import type { Matches } from "../../backend/share/type/Matches";
import NotFound from "./NotFound";

interface PlayerBoxProps {
  name: string;
}

const PlayerBox: React.FC<PlayerBoxProps> = ({ name }) => (
  <div className="px-3 py-2 bg-white border rounded shadow text-sm font-medium">
    {name}
  </div>
);

function Bracket({ state }: { state?: string }) { 

    return (
        <div className="flex items-center justify-center">

            {/* Bracket container */}

            <div className="flex gap-12">

                <div className="flex flex-col gap-12 mt-22">
                    <div className="flex flex-col gap-2">
                        <PlayerBox name="3rd" />
                    </div>
                </div>

                {/* Round 1 */}
                <div className="flex flex-col gap-12">
                    <div className="flex flex-col gap-2">
                        <PlayerBox name="Player 1" />
                        <PlayerBox name="Player 2" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <PlayerBox name="Player 3" />
                        <PlayerBox name="Player 4" />
                    </div>
                </div>

                {/* Round 2 */}
                <div className="flex flex-col gap-24 justify-center">
                    <PlayerBox name="Final A" />
                    <PlayerBox name="Final B" />
                </div>

                {/* Final */}
                <div className="flex flex-col justify-center">
                    <PlayerBox name="Champion" />
                </div>
            </div>
        </div>  
  );
}

function Loading({matches, load}: {matches?: any, load: boolean}) {
    const p1 = "p1";
    const p2 = "p2";
    const p3 = "p3";
    const p4 = "p4";

    React.useEffect(() => {
        console.log("Loading: useEffect");
        console.log("Loading: ", load);
    }, []);

    return (
        <div>
            {
                load ? (
                    <div>
                        <h1>Loading...</h1>
                    </div>
                ) : (
                    <div>
                        <h1>{p1},{p2},{p3},{p4}</h1>
                    </div>
                )
            }
        </div>
    );
}

export function TournamentGamePage() {
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
    let init: boolean = false;

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
                    //update leaderboard
                    console.log("TournamentGamePage: setLoad to false");
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
            <Route path="/" element={<Loading load={load} />} />
            <Route
                path="gameplay"
                element={<GamePage onGameOver={handleGameOver} />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}