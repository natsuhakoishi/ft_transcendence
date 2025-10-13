import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

import { initDB } from './database/tables.ts';
import userApi from './routes/api/user-api.ts';
import authApi from './routes/api/auth-api.ts';
import profileApi from './routes/api/profile-api.ts';
import friendshipApi from './routes/api/friendship-api.ts';
import matchApi from './routes/api/match-api.ts';
import tournamentApi from './routes/api/tournament-api.ts';
import jwtPlugin from './routes/api/jwt-plugin.ts'
import tournamentGetApi from './routes/api/tournament-get-api.ts';
import authGoogleApi from './routes/api/auth-google-api.ts';

//game
import websocketPlugin from "@fastify/websocket";
import AIRoomManagerPlugin from "./share/type/AIroomData.ts"
import roomManagerPlugin from "./share/type/roomData.ts"
import TournamentRoomManagerPlugin from "./share/type/tournamentRoomData.ts"
import match from './routes/game/match.ts';
import games from './routes/game/games.ts';
import gamesTournament from './routes/game/gamesTournament.ts';
import AI from './routes/game/gameAI.ts';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const PEM_PASS = process.env.PEM_PASS;
const BACKEND_PORT = process.env.BACKEND_PORT;
export const SMTP_EMAIL = process.env.SMTP_EMAIL;
export const SMTP_APP_SECRET = process.env.SMTP_APP_SECRET;

export const GAME_BOARD_WIDTH_PX: string | undefined = process.env.GAME_BOARD_WIDTH_PX;
export const GAME_BOARD_HEIGHT_PX: string | undefined = process.env.GAME_BOARD_HEIGHT_PX;
export const GAME_PADDLES_HEIGHT_PX: string | undefined = process.env.GAME_PADDLES_HEIGHT_PX;
export const GAME_PADDLES_WIDTH_PX: string | undefined = process.env.GAME_PADDLES_WIDTH_PX;
export const GAME_PADDLES_MARGIN_PX: string | undefined = process.env.GAME_PADDLES_MARGIN_PX;

if (!GAME_BOARD_WIDTH_PX || !GAME_BOARD_HEIGHT_PX || 
	!GAME_PADDLES_HEIGHT_PX || !GAME_PADDLES_WIDTH_PX || 
	!GAME_PADDLES_MARGIN_PX)
{
	console.error('Error: Game\'s env not found');
	process.exit(1);
}

if (!JWT_SECRET)
{
	console.error('Error: JWT_SECRET not found');
	process.exit(1);
}

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET)
{
	console.error('Error: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not found');
	process.exit(1);
}

if (!PEM_PASS)
{
	console.error('Error: PEM_PASS not found!');
	process.exit(1);
}

if (!BACKEND_PORT)
{
	console.error('Error: BACKEND_PORT not found!');
	process.exit(1);
}

async function initServer()
{
	const cert_dirname = path.dirname(fileURLToPath(import.meta.url));
	const cert_path = path.join(cert_dirname, 'certs');
	if (!fs.existsSync(cert_path))
	{
		console.error('Error: certs path not found');
		process.exit(1);
	}

	const fastify = Fastify({
		logger: true,
		https: {
			key: fs.readFileSync(path.join(cert_path, "backend-ssl.key")),
			cert: fs.readFileSync(path.join(cert_path, "backend-ssl.crt")),
			passphrase: PEM_PASS
		}
	});
	await initDB();

	await fastify.register(cors, {
		origin: ["https://localhost:5173", "https://192.168.1.131:5173", "https://54456d68ae06.ngrok-free.app"],
		//have to manually set ngrok url here as frontend origin else CORS KABOOM
		credentials: true,
	});

	await fastify.register(multipart, {
		limits: {
			fileSize: 10 * 1024 * 1024
		}
	});

	const dir_name = path.dirname(fileURLToPath(import.meta.url));
	const avatars_path = path.join(dir_name, 'assets/avatars');
	await fastify.register(fastifyStatic, { root: avatars_path, prefix: '/avatars/' });

	await fastify.register(fastifyCookie);
	await fastify.register(jwt, { secret: JWT_SECRET,  cookie: { cookieName: "cookiesToken", signed: false } });

	await fastify.register(authApi, { prefix: '/api' });
	await fastify.register(authGoogleApi, { prefix: '/api' });
	await fastify.register(tournamentGetApi, { prefix: '/api' });

	// game
	fastify.register(roomManagerPlugin);
	fastify.register(TournamentRoomManagerPlugin);
	fastify.register(AIRoomManagerPlugin);
	await fastify.register(websocketPlugin);
	await fastify.register(match, {prefix: '/game'});
	await fastify.register(games, {prefix: "/game"});
	await fastify.register(gamesTournament, {prefix: "/game/tournament"});
	await fastify.register(AI, {prefix: '/game/AI'});

	await fastify.register(async (privateApiRoutes: any) => {
	await privateApiRoutes.register(jwtPlugin);
		await privateApiRoutes.register(userApi);
		await privateApiRoutes.register(profileApi);
		await privateApiRoutes.register(friendshipApi);
		await privateApiRoutes.register(matchApi);
		await privateApiRoutes.register(tournamentApi);
	}, { prefix: '/api/private' });

// Feat: print received cookie for every request
//   fastify.addHook('onRequest', (req, res, done) => {
//     console.log('Cookies received:', req.cookies);
//     done();
//   });

	return fastify;
}

async function main()
{
	const server = await initServer();

	try
	{
		await server.listen({ port: Number(BACKEND_PORT), host: "0.0.0.0"});
		console.log(`Server listening at https://localhost:${BACKEND_PORT}`);
	}
	catch (error)
	{
		server.log.error(error);
		process.exit(1);
	}

	const close_server = async() => {
		console.log("Server shutting down...");
		try
		{
			await server.close();
			console.log("Server closed successfully");
			process.exit(0);
		}
		catch (error)
		{
			console.error("Error when shutting down server: ", error);
			process.exit(1);
		}
	};
	process.on('SIGINT', close_server);
	process.on('SIGTERM', close_server);
}

main();
