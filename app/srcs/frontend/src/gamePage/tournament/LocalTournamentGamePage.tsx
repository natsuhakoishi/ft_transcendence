import React from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import type { GameData, localTData, TData } from "../../../../backend/share/type/gameData";
import type { MatchPlayersData } from "../../../../backend/share/type/Matches";
import { LocalTournamentLoading } from "./TournamentLoadingPage";
import { TournamentResultPage } from "../components/ResultPage";
import { withTranslation, type TranslationProps } from "../../_hooks/language";
import { LocalGamePage } from "../1v1/local/lGamePage";
import { Loading } from "../LoadingPage";

function LocalTournamentGameP({ t, toasterPluz }: TranslationProps) { 
    let init: boolean = false;
    const navigate = useNavigate();
    const [load, setLoad] = React.useState(true);
    const location = useLocation();
    const { id } = (location.state || {}) as {id: number};
    const wsRef = React.useRef<WebSocket | null>(null);
    const gameDataRef = React.useRef<GameData>({
        roomId: id.toString(),
        playerId: id,
        keyPress: "init",
        tournament: true
    });
    const [leaderboard, setLeaderboard] = React.useState<MatchPlayersData[]>();

    React.useEffect(() => {
        document.title = t("title_tour");
        ( async () => {
            console.log("LocalTournamentGamePage: useEffect");
            if (!id)
            {
                console.log("LocalTournamentGamePage: Trespassing ^u^b");
                navigate(import.meta.env.VITE_PATH_404NOTFOUND, {replace: true});
            }

            console.log("LocalTournamentGamePage", id);

            const ws: WebSocket = new WebSocket(import.meta.env.VITE_GAME_API_LOCAL_TOURNAMENT_GAMEPLAY!);
            wsRef.current = ws;

            ws.onopen = () => {
                if (!init)
                {
                    console.log("LocalTournamentGamePage: init");
                    ws.send(JSON.stringify(gameDataRef.current));
                    init = true;
                }
            }

            ws.onmessage = (msg) => {
                const parse: { type: string, state: localTData} = JSON.parse(msg.data);
                const type: string = parse.type;
                const { state } = parse;

                console.log("LocalTournamentGamePage: rev msg", parse);

                if (type === "trespassing")
                {
                    toasterPluz("game.ERR_trespassing");
                    console.log("LocalTournamentGamePage ws.onmessage: Trespassing ^u^b");
                    navigate(import.meta.env.VITE_PATH_404NOTFOUND, {replace: true});
                }
                else if (type === "update")
                {
                    if (state.state === "r1")
                        setLeaderboard(state.round1);
                    else
                        setLeaderboard(state.round2);
                    console.log("LocalTournamentGamePage: setLoad to false", parse.state);
                    setLoad(false);
                }
                else if (type === "startRound")
                {
                    console.log("LocalTournamentGamePage: round1");
                    const matchData: MatchPlayersData = state.matches[state.matchCount];
                    
                    navigate("/game/tournament/local/loading", {
                        state: {tournament: true},
                        replace: true
                    });
                    setTimeout(() => {
                        navigate(import.meta.env.VITE_GAME_PATH_LOCAL_GAMEPLAY, {
                            state: {
                                playersData: matchData,
                                tournament: true
                            }, replace: true 
                        });
                    }, 1000 * 2);
                }
                else if (type === "end")
                {
                    console.log("LocalTournamentGamePage: end");
                    console.log("LocalTournamentGamePage: leaderboard: ", parse);
                    setTimeout(() => {
                        console.log("LocalTournamentGamePage: to:", import.meta.env.VITE_GAME_PATH_TOURNAMENT_RESULT);
                        navigate(import.meta.env.VITE_GAME_PATH_TOURNAMENT_RESULT, { state: {leaderboard: parse.state.leaderboard, playerID: 0}, replace: true});
                    }, 1000 * 4);
                    //TODO possible to return to game page if hit "back" while navigating
                }
                else if (type === "offline")
                {
                    console.log("LocalTournamentGamePage: player offline");
                    toasterPluz("game.ERR_Disconnect");
                    toasterPluz("game.ERR_TourCancel");
                    console.log("LocalTournamentGamePage: redirect to home");
                    navigate("/", { replace: true });
                }
            }

        })();

        return () => { //when user press 'back button'
            console.log("LocalTournamentGamePage: closing ws");
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
        console.log("LocalTournamentGamePage: handleGameOver");
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            setLoad(true);
            gameDataRef.current.keyPress = "over";
            console.log("LocalTournamentGamePage: handleGameOver: ", gameDataRef.current);
            wsRef.current.send(JSON.stringify(gameDataRef.current));
        }
    }

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <LocalTournamentLoading
                        matches={leaderboard}
                        load={load}
                    />
                }
            />
            <Route
                path="gameplay"
                element={ <LocalGamePage onGameOver={handleGameOver}/>}
            />
            <Route
                path="result"
                element={<TournamentResultPage/>}
            />
            <Route
                path="loading"
                element={<Loading tournament={true}/>}
            />
            {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
    );
}

export const LocalTournamentGamePage = withTranslation(LocalTournamentGameP);