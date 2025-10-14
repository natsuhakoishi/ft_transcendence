import type { GameData } from "../../../backend/share/type/gameData";
import { Countdown } from "./countdown";

export function Banner({
        confirm, 
        start, ready, gameData
    }: {
        confirm: boolean,
        start: boolean,
        ready: boolean,
        gameData: GameData | null,
    }) {

    if (!gameData)
            return ;

    // console.log("Banner: ", confirm, start, ready);

    return (
        <>
            {
                !confirm ? (
                    <Countdown
                        start={10}
                        timeout={() => {
                            // gameData.keyPress = "timeout";
                            // ws.send(JSON.stringify(gameData));
                        }}
                        describe="Press [Space] to ready:" />
                ) : !start ? (
                    <h1 className="text-3xl font-bold text-center">Waiting for opponent confirm game</h1>
                ) : ready ? (
                        <Countdown
                        start={2}
                        timeout={() => {}}
                        describe="Ready:" />
                ) : <h1 className="text-3xl font-bold text-center">Pong!</h1>
            }
        </>
    )
}

// export function Banner({
//         countdown,
//         Load,
//         confirm,
//         gameData,
//         ws,
//         setCountdown,
//         start
//     } :{
//         countdown: boolean,
//         Load: boolean,
//         confirm: boolean,
//         gameData: GameData,
//         ws: WebSocket,
//         setCountdown: (set: boolean) => void,
//         start: boolean
//     }) {

//     const [ waiting, setWaiting ] = React.useState(false);
//     const [ waitingOpponent, SetWaitingOpponent ] = React.useState(false);
//     const [ startCountdown, setStartCountdown ] = React.useState(false);
//     countdown && !Load && !confirm ? setWaiting(true) : setWaiting(false);
//     countdown && !Load && confirm ? SetWaitingOpponent(true) : SetWaitingOpponent(false);
//     countdown && !Load && confirm && start ? () => {setCountdown(false); setStartCountdown(true);} : setStartCountdown(false);

//     return (
//         <>
//             {
//                 countdown && !Load && !confirm ? (
//                     <Countdown 
//                         start={10}
//                         gameData={gameData}
//                         ws={ws}
//                         close={() => {}}
//                         describe="Waiting for Confirm game [Enter]: "
//                     />) : (
//                         <h1></h1>
//                     )
//             }
//         </>
//     );
// }
