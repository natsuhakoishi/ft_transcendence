import React from "react";
import { GamePage } from "./gamePage";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetchPrivate } from "./utils";
import type { GameData, TData } from "../../backend/share/type/gameData";
import type { Matches } from "../../backend/share/type/tournamentRoomData";

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


// function FlowPage({ roomID, onStart }: { roomID: string | null, onStart: (roomID: string) => void })
// {
//     const navigate = useNavigate();

//     React.useEffect(() => {

//     }, [onStart]);

//     return (
//         <div className="scale-200">
//             <Bracket />
//             {/* <h1>something here</h1> */}
//         </div>
//     );
// }

export function TournamentGamePage() {
    const navigate = useNavigate();
    const [showGame, setShowGame] = React.useState(false);
    const [roomID, setRoomID] = React.useState<string | undefined>(undefined);
    const [state, setState] = React.useState<null | "round1Start" | "round1End" | "round2Start" | "round2End">(null);
    const [ queryParams ] = useSearchParams();
    const tournamentRoomID: string | null = queryParams.get("ROOMID");

    React.useEffect(() => {
        ( async () => {
            console.log("TournamentGamePage: useEffect");
            if (!tournamentRoomID)
            {
                console.log("TournamentGamePage: Trespassing ^u^b");
                navigate(import.meta.env.VITE_PATH_404NOTFOUND);
            }

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
            const ws = new WebSocket(import.meta.env.VITE_GAME_TOURNAMENT_GAMEPLAY_ROUTE!);

            const gameData: GameData = {
                roomId: tournamentRoomID!,
                playerId: parseInt(playerID!),
                keyPress: "null",
                tournament: true
            }

            ws.onmessage = (msg) => {
                const parse: { type: string, state: TData} = JSON.parse(msg.data);
                const type: string = parse.type;
                console.log("TournamentGamePage: rev msg", parse);

                if (type === "startRound1")
                {
                    console.log("TournamentGamePage: round1");
                    const r1: Matches = parse.state.round1;
                    const rooms: string[] = r1.roomID[0].split("-");
                    if (rooms.includes(playerID))
                        setRoomID(r1.roomID[0]);
                    else 
                        setRoomID(r1.roomID[1]);
                    console.log("TournamentGamePage: roomID: " + roomID);
                    setShowGame(true);
                }
                else if (type === "startRound2")
                {
                    console.log("TournamentGamePage: round2");
                    const r2: Matches = parse.state.round2;
                    const rooms: string[] = r2.roomID[0].split("-");
                    if (rooms.includes(playerID))
                        setRoomID(r2.roomID[0]);
                    else 
                        setRoomID(r2.roomID[1]);
                    console.log("TournamentGamePage: roomID: " + roomID);
                    setShowGame(true);
                }
            }

            let ready = false;
            document.addEventListener("keydown", (e) => {
                if (e.key === "Enter" && !ready)
                {
                    ready = true;
                    gameData.keyPress = "Enter";
                    ws.send(JSON.stringify(gameData));
                    console.log("TournamentGamePage: Enter");           
                }
            });

        })();


    }, []);

    return (
        <div>
            {
                showGame ? (
                    <GamePage _roomID={roomID} onExit={() => {
                            setShowGame(false);
                            
                        }
                    } />
                ) :
                <Bracket />
            }
        </div>
    );
}