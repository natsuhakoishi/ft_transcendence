import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';

import { initDB } from './database/tables.ts';
import userApi from './routes/api/user-api.ts';
import authApi from './routes/api/auth-api.ts';

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
		// { logger: true }
	);
	await initDB();

	await fastify.register(jwt, { secret: JWT_SECRET });
	await fastify.register(userApi, { prefix: '/api/user' });
	await fastify.register(authApi, { prefix: '/api/auth' });
	return fastify;
}

async function main()
{
	const server = await initServer();

	try {
		await server.listen({ port: 4242, host: "0.0.0.0"});
		console.log("Server listening at http://localhost:4242");
	}
	catch (error)
	{
		server.log.error(error);
		process.exit(1);
	}
}

main();
