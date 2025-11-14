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

//game
import websocketPlugin from "@fastify/websocket";
import AIRoomManagerPlugin from "./share/type/AIroomData.ts"
import roomManagerPlugin from "./share/type/roomData.ts"
import localRoomManagerPlugin from "./share/type/localRoomData.ts"
import TournamentRoomManagerPlugin from "./share/type/tournamentRoomData.ts"
import match from './routes/game/match.ts';
import games from './routes/game/games.ts';
import LocalGameplay from './routes/game/localGame.ts';
import gamesTournament from './routes/game/gamesTournament.ts';
import AI from './routes/game/gameAI.ts';
import { createDevTeamUser } from './database/devteam.ts';


const __filename = path.dirname(fileURLToPath(import.meta.url));
const __dirname = path.join(__filename, '..', '..', '..');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const JWT_SECRET = process.env.JWT_SECRET!;
const PEM_PASS = process.env.PEM_PASS;
const BACKEND_PORT = process.env.BACKEND_PORT;
const FRONTEND_PORT = process.env.FRONTEND_PORT;
const IP = process.env.IP || 'localhost';
export const SMTP_EMAIL = process.env.SMTP_EMAIL;
export const SMTP_APP_SECRET = process.env.SMTP_APP_SECRET;

export const Q_MAIL = process.env.Q_MAIL!;
export const Z_MAIL = process.env.Z_MAIL!;
export const Y_MAIL = process.env.Y_MAIL!;
export const D_PASS = process.env.D_PASS!;

export const GAME_BOARD_WIDTH_PX: string | undefined = process.env.GAME_BOARD_WIDTH_PX;
export const GAME_BOARD_HEIGHT_PX: string | undefined = process.env.GAME_BOARD_HEIGHT_PX;
export const GAME_PADDLES_HEIGHT_PX: string | undefined = process.env.GAME_PADDLES_HEIGHT_PX;
export const GAME_PADDLES_WIDTH_PX: string | undefined = process.env.GAME_PADDLES_WIDTH_PX;
export const GAME_PADDLES_MARGIN_PX: string | undefined = process.env.GAME_PADDLES_MARGIN_PX;
export const GAME_BALL_RADIUS_PX: string | undefined = process.env.GAME_BALL_RADIUS_PX;
export const GAME_BALL_VX_PX: string | undefined = process.env.GAME_BALL_VX_PX;
export const GAME_BALL_VY_PX: string | undefined = process.env.GAME_BALL_VY_PX;
export const GAME_STUPID_AI_CONFIG: string | undefined = process.env.GAME_STUPID_AI_CONFIG;

if (!GAME_BOARD_WIDTH_PX || !GAME_BOARD_HEIGHT_PX ||
	!GAME_PADDLES_HEIGHT_PX || !GAME_PADDLES_WIDTH_PX ||
	!GAME_PADDLES_MARGIN_PX || !GAME_BALL_RADIUS_PX ||
	!GAME_BALL_VX_PX || !GAME_BALL_VY_PX || !GAME_STUPID_AI_CONFIG)
{
	console.error('Error: Game\'s env not found');
	process.exit(1);
}

if (!JWT_SECRET)
{
	console.error('Error: JWT_SECRET not found');
	process.exit(1);
}

if (!PEM_PASS)
{
	console.error('Error: PEM_PASS not found!');
	process.exit(1);
}

if (!BACKEND_PORT || !FRONTEND_PORT)
{
	console.error('Error: PORT not found!');
	process.exit(1);
}

async function initServer()
{
	const cert_dirname = path.dirname(fileURLToPath(import.meta.url));
	const cert_path = path.join(cert_dirname, '..', '..', '..', 'certs');
	if (!fs.existsSync(cert_path))
	{
		console.error('Error: certs path not found');
		process.exit(1);
	}

	const fastify = Fastify({
		logger: true,
		https: {
			key: fs.readFileSync(path.join(cert_path, "klbq-ssl.key")),
			cert: fs.readFileSync(path.join(cert_path, "klbq-ssl.crt")),
			passphrase: PEM_PASS
		}
	});
	await initDB();

	await fastify.register(cors, {
		origin: [`https://${IP}:${FRONTEND_PORT}`],
		credentials: true,
		methods: ['GET', 'POST']
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
	await fastify.register(tournamentGetApi, { prefix: '/api' });

	// game
	fastify.register(roomManagerPlugin);
	fastify.register(localRoomManagerPlugin);
	fastify.register(TournamentRoomManagerPlugin);
	fastify.register(AIRoomManagerPlugin);
	await fastify.register(websocketPlugin);
	await fastify.register(match, {prefix: '/game'});
	await fastify.register(games, {prefix: "/game"});
	await fastify.register(gamesTournament, {prefix: "/game/tournament"});
	await fastify.register(AI, {prefix: '/game/AI'});
	await fastify.register(LocalGameplay, {prefix: '/game/local'});

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

	fastify.get('/', async (req: any, res: any) => {
		void(req);
		res.redirect(`https://${IP}:${FRONTEND_PORT}/`);
	});

	await createDevTeamUser();

	return fastify;
}

async function main()
{
	const server = await initServer();

	try
	{
		await server.listen({ port: Number(BACKEND_PORT), host: "0.0.0.0"});
		console.log(`Server listening at https://${IP}:${BACKEND_PORT}`);
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
