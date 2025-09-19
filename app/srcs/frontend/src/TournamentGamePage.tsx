import React from "react";
import { GamePage } from "./gamePage";
import { useNavigate, useSearchParams } from "react-router-dom";

function FlowPage({ roomID, onStart }: { roomID: string | null, onStart: (roomID: string) => void })
{
    React.useEffect(() => {
        console.log("FlowPage: useEffect");
        if (!roomID)
            return ;
        //other logic here

        //rev start signal
        //onStart();
    }, [onStart]);

    return (
        <div>
            <h1>something here</h1>
        </div>
    );
}

export function TournamentGamePage() {
    const navigate = useNavigate();
    const [showGame, setShowGame] = React.useState(false);
    const [roomID, setRoomID] = React.useState<string | undefined>(undefined);
    const [ queryParams ] = useSearchParams();
    const tournamentRoomID: string | null = queryParams.get("ROOMID");

    React.useEffect(() => {
        console.log("TournamentGamePage: useEffect");
        if (!tournamentRoomID)
        {
            console.log("TournamentGamePage: Trespassing ^u^b");
            navigate(import.meta.env.VITE_PATH_404NOTFOUND);
        }
        
    }, []);

    return (
        <div>
            {
                showGame ? (
                    <GamePage _roomID={roomID} onExit={() => setShowGame(false)} />
                )
                : (
                    <FlowPage roomID={tournamentRoomID} onStart={(id) => {
                        setRoomID(id);
                        setShowGame(true);
                    }} />
                )
            }
        </div>
    );
}