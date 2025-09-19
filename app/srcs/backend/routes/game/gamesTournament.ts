import type { FastifyPluginAsync } from "fastify";
import type { TData } from "../../share/type/gameData.ts";

const gamesTournament: FastifyPluginAsync = async (fastify: any) => {

    fastify.get("/tournament/gameplay", { websocket: true }, (connection: any, req) => {

            console.log("/tournament/gameplay(get): receive message from player", data);


        });

        


}