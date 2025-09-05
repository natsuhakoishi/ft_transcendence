import type { FastifyPluginAsync } from "fastify";
import fp from 'fastify-plugin';

const jwtPlugin: FastifyPluginAsync = async (fastify: any) => {
	if (!fastify.hasRequestDecorator('user'))
		fastify.decorateRequest('user', null);

	fastify.addHook('preHandler', async (req: any, res: any) => {
		if (!req.url.startsWith('/api/private'))
			return ;
		await req.jwtVerify();
		req.user = (req.user as any).id;
	});
};

export default fp(jwtPlugin);
