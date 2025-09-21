import type { GameData } from "../../share/type/gameData.ts";
import type { Player } from "../../share/type/roomData.ts";
import { TRoom } from "../../share/type/tournamentRoomData.ts";

export function handleKeyPress(room: TRoom, data: GameData, player: Player): void {

    const pos: string = data.roomId.indexOf(data.playerId.toString()) === 0 ? "left" : "right";
    console.log("/gameplay: handleKeyPress: " + data.keyPress);

    // if (!room.getState().gamingStage && room.size() < 2 && data.keyPress === "Enter") //starting game / confirm key
    // {
    //     room.addPlayer(player);
    //     console.log("roomID " + room.getRoomID() + ": player " + player.id.toString() + " ready! " + room.size().toString() + "/2");
    //     // ws.send(JSON.stringify(room.getState()));
    // }
}