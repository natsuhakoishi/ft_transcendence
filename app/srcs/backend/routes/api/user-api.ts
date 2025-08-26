import type { FastifyPluginAsync } from 'fastify';
import { createUser, getUserById } from "../../database/user.ts";

const userApi: FastifyPluginAsync = async (fastify) => {
	fastify.get('/me', async (req, res) => {
		const verify = await req.jwtVerify() as any;
		if (!verify)
			return res.status(403).send({ message: 'Permission Denied' });

		const user = await getUserById(verify.id);
		if (!user)
			return res.status(404).send({ message: 'User not found' });

		const { password, ...userXPass } = user;
		res.send(userXPass);
	});
};

export default userApi;
