import type { FastifyPluginAsync } from 'fastify';
import { createUser, getUserById } from "../../database/users.ts";

const userApi: FastifyPluginAsync = async (fastify) => {
	fastify.get('/:id', async (req, res) => {
		const { id } = req.params as { id: string };
		const user = await getUserById(Number(id));
		return user ?? { error: "User not exist" };
	});

	fastify.post('/', async (req, res) => {
		const { username, email, password } = req.body as {
			username: string;
			email: string;
			password: string;
		};
		await createUser(username, email, password);
		return { success: true };
	});
};

export default userApi;
