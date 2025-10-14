import type { FastifyPluginAsync } from 'fastify';
import { getUserById } from "../../database/user.ts";

const userApi: FastifyPluginAsync = async (fastify: any) => {
	fastify.get('/me', async (req: any, res: any) => {
		try
		{
		if (!req.user)
			return res.status(401).send({ message: 'Unauthorized: missing token' });

		const user = await getUserById(Number(req.user));
		if (!user)
			return res.status(404).send({ message: 'User Not Found' });

		const { password, ...userXPass } = user;
		res.send(userXPass);
		}
		catch (error)
		{
			res.status(500).send({ message: 'Server Error: check user(me)' });
		}
	});
};

export default userApi;
