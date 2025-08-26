import type { FastifyPluginAsync } from 'fastify';
import { createUser, getUserById } from "../../database/users.ts";

const userApi: FastifyPluginAsync = async (fastify) => {
	fastify.get('/:id', async (req, res) => {
		const { id } = req.params as { id: string };
		const user = await getUserById(Number(id));
		return user ?? { error: "User not exist" };
	});
};

export default userApi;
