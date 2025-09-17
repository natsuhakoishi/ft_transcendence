import type { FastifyPluginAsync } from "fastify";
import type { TGameData } from "../../share/type/gameData.ts";

const gamesTournament: FastifyPluginAsync = async (fastify: any) => {

        fastify.post("/tournament/gameplay", async (request, reply) => {
            const data: TData = request.body as TData;
    
            console.log("/tournament/gameplay(post): receive message from player", data);
    
            return { status: "ok", received: data };
        });

}