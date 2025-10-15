import type { GameData } from "../../../backend/share/type/gameData";
import { useLang } from "../_hooks/language";
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

    const { t } = useLang();
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
                        describe={t("shared.game.preparing")} />
                ) : !start ? (
                    <h1 className="text-3xl font-bold text-center">{t("shared.game.waiting")}</h1>
                ) : ready ? (
                        <Countdown
                        start={2}
                        timeout={() => {}}
                        describe={t("shared.game.ready")} />
                ) : <h1 className="text-3xl font-bold text-center">{t("shared.game.onGoing")}</h1>
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
