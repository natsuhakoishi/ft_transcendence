import type { FastifyPluginAsync } from "fastify";
import type { TData } from "../../share/type/gameData.ts";

const gamesTournament: FastifyPluginAsync = async (fastify: any) => {
    fastify.get("/gameplay", { websocket: true }, (connection: any, req) => {
        const ws = connection;
        console.log("/gameplay: connected");

        ws.on("message", (msg) => {
            console.log("/tournament/gameplay(get): receive message from player", msg);

            

        });




        });
}

export default gamesTournament;