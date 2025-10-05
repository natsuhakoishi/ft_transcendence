import type { AIRoom } from "../../share/type/AIroomData.ts";
import { GameState } from "../../share/type/gameState.ts";
import type { Player } from "../../share/type/Player.ts";
import { keyLogic, runLoop } from "./gameLogic.ts";

export function handleKeyPressAI(keyPress: string, room: AIRoom, player?: Player): void {

    if (keyPress === "init") {
        room.addPlayer(player!);
    }
    else if (keyPress === "Enter")
        room.setConfirm();
    else if (room.getState().gamingStage)
        if (!player)
            keyLogic(room, keyPress, "right");
        else 
            keyLogic(room, keyPress, "left");
}
