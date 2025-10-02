import type { FastifyPluginAsync } from "fastify";
import { createMatch, getMatchByUserId } from "../../database/match.ts";

const matchApi: FastifyPluginAsync = async (fastify: any) => {
	fastify.post('/match', async (req: any, res: any) => {
		try
		{
			const { player1_id, player2_id, player1_score, player2_score, tournament_flag } = req.body as any;

			if (typeof player1_id !== 'number' || typeof player2_id !== 'number' || typeof player1_score !== 'number' || typeof player2_score !== 'number')
				return res.status(400).send({ message: 'Invalid match data input' })
			await createMatch(player1_id, player2_id, player1_score, player2_score, tournament_flag);
		}
		catch (error)
		{
			res.status(401).send({ message: 'Unauthorize or Error creating match' });
		}
	});

	fastify.get('/match/me', async (req: any, res: any) => {
		try
		{
			const user_id = req.user;
			const user_matches = await getMatchByUserId(user_id);

			const obj = { user_id, user_matches };

			res.send({ obj });
		}
		catch (error)
			{
			res.status(401).send({ message: 'Unauthorize or Error getting match record' });
		}
	});
}

export default matchApi;
