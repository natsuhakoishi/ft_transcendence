import fastify from "fastify";
import type { FastifyPluginAsync } from "fastify";
// import fastify, { FastifyPluginAsync } from "fastify";
import type { GameData } from "../../share/type/gameData";

const games: FastifyPluginAsync = async(fastify: any) => {
    fastify.post("/gameplay", async (request, reply) => {
        const data: GameData = request.body as GameData;

        console.log("games(post): receive message from player", data);
        console.log("room id:" + data.roomId + " player id: " + data.playerId);

        //TODO: save data.
        return { status: "ok", received: data };
    });


    fastify.get("/gameplay", { websocket: true }, (connection: any, req) => {
        const ws = connection;

        console.log("/games: connected");

        ws.on("message", (msg) => {
            console.log("games: receive message from player", msg.toString());

            const data: GameData = JSON.parse(msg.toString());
            console.log("/game: room id: " + data.roomId);
            console.log("/game: player id: " + data.playerId.toString());
            console.log("/game: player pressed: " + data.keyPress);
        });

        ws.on("close", () => console.log("/games(get): player disconnected"));

    });


};

export default games;