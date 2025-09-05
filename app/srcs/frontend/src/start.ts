// R E M E M B E R * RUN * TSC * S C R I C P T !

function initGame(): void
{
    initPlayerAva();
    console.log("set player avatar");

    initPlayerID();
    console.log("set player id");


}

function pong(): void
{
    const board = document.getElementById("gameBoard") as HTMLCanvasElement;

    const context = board.getContext("2d");


}

function initPlayerID(): void
{
    const p1 = document.getElementById("p1ID") as HTMLHeadingElement;
    const p2 = document.getElementById("p2ID") as HTMLHeadingElement;

    // FIXME: change to get player profile
    p1.innerText = "Player1";
    p2.innerText = "Player2";
}

function initPlayerAva(): void
{
    const p1 = document.getElementById("p1Ava") as HTMLImageElement;
    const p2 = document.getElementById("p2Ava") as HTMLImageElement;

    // FIXME: change to get player profile
    p1.src = "../pic/heng.png";
    p2.src = "../pic/heng.png";

}

document.addEventListener("DOMContentLoaded", function (): void {initGame();} );