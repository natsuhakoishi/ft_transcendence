import type { FastifyPluginAsync } from "fastify";
import fp from 'fastify-plugin';

const jwtPlugin: FastifyPluginAsync = async (fastify: any) => {
	if (!fastify.hasRequestDecorator('user'))
		fastify.decorateRequest('user', null);

	fastify.addHook('preHandler', async (req: any, res: any) => {
		if (!req.url.startsWith('/api/private'))
			return ;

		const token = req.cookies.cookiesToken;
		if (!token)
			return res.status(401).send({ message: "Unauthorized due to missing cookiesToken" });

		try
		{
			const jwt = fastify.jwt.verify(token);
			req.user = (jwt as any).id;
		}
		catch (error)
		{
			return res.status(401).send({ message: "Invalid or expired Token" });
		}
	});
};

export default fp(jwtPlugin);
