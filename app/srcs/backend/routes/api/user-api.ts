import type { FastifyPluginAsync } from 'fastify';
import { getUserById } from "../../database/user.ts";

const userApi: FastifyPluginAsync = async (fastify) => {
	fastify.get('/me', async (req, res) => {
		const jwt = await req.jwtVerify() as any;
		if (!jwt)
			return res.status(403).send({ message: 'Permission Denied' });

		const user = await getUserById(jwt.id);
		if (!user)
			return res.status(404).send({ message: 'User not found' });

		const { password, ...userXPass } = user;
		res.send(userXPass);
	});
};

export default userApi;
