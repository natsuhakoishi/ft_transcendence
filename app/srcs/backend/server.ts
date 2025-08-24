import Fastify, { fastify } from 'fastify'
import { initDB } from './database/tables.ts'
import userApi from './routes/api/users-api.ts'

async function initServer()
{
	const fastify = Fastify({ logger: true });
	await initDB();

	await fastify.register(userApi, {prefix: '/api/users'});
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
