import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import path from 'path';

import { initDB } from './database/tables.ts';
import userApi from './routes/api/user-api.ts';
import authApi from './routes/api/auth-api.ts';
import profileApi from './routes/api/profile-api.ts';
import friendshipApi from './routes/api/friendship-api.ts';
import matchApi from './routes/api/match-api.ts';
import tournamentApi from './routes/api/tournament-api.ts';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET)
{
	console.error('Error: JWT_SECRET not found');
	process.exit(1);
}

async function initServer()
{
	const fastify = Fastify(
		{ logger: true }
	);
	await initDB();

	await fastify.register(cors, {
		origin: true,
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

	await fastify.register(jwt, { secret: JWT_SECRET });
	await fastify.register(userApi, { prefix: '/api' });
	await fastify.register(authApi, { prefix: '/api' });
	await fastify.register(profileApi, { prefix: '/api' });
	await fastify.register(friendshipApi, { prefix: '/api' });
	await fastify.register(matchApi, { prefix: '/api' });
	await fastify.register(tournamentApi, { prefix: '/api' });
	return fastify;
}

async function main()
{
	const server = await initServer();

	try
	{
		await server.listen({ port: 4242, host: "0.0.0.0"});
		console.log("Server listening at http://localhost:4242");
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
