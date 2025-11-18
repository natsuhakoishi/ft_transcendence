import type { GameScore } from "../../../../backend/share/type/gameState.ts";

function Eq({score} : {score: GameScore}) {
    return (
    <div className="flex text-5xl mb-2">
        <h1 className="text-green-500">{score.p1Score}</h1>
        <h1 className="text-black-500">-</h1>
        <h1 className="text-green-500">{score.p2Score}</h1>
    </div>
    );
}

function P1({score} : {score: GameScore}) {
    return (
    <div className="flex text-5xl mb-2">
        <h1 className="text-green-500">{score.p1Score}</h1>
        <h1 className="text-black-500"> - </h1>
        <h1 className="text-red-500">{score.p2Score}</h1>
    </div>
    );
}

function P2({score} : {score: GameScore}) {
    return (
    <div className="flex text-5xl mb-2">
        <h1 className="text-red-500">{score.p1Score}</h1>
        <h1 className="text-black-500"> - </h1>
        <h1 className="text-green-500">{score.p2Score}</h1>
    </div>
    );
}

export function Score({score} : {score: GameScore}) {

    return (
        <>
        {
            score.p1Score === score.p2Score ? <Eq score={score}/> : (
                score.p1Score > score.p2Score ? <P1 score={score}/> : <P2 score={score} />
            )
        }
        </>
    )
}