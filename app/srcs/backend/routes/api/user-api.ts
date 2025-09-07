import type { FastifyPluginAsync } from 'fastify';
import { getUserById } from "../../database/user.ts";

const userApi: FastifyPluginAsync = async (fastify: any) => {
	fastify.get('/me', async (req: any, res: any) => {
		const user_id = req.user;
		if (!user_id)
			return res.status(403).send({ message: 'Permission Denied' });

		const user = await getUserById(Number(user_id));
		if (!user)
			return res.status(404).send({ message: 'User not found' });

		const { password, ...userXPass } = user;
		res.send(userXPass);
	});
};

export default userApi;
