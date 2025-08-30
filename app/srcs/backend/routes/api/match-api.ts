import type { FastifyPluginAsync } from "fastify";
import { createMatch, getMatchByUserId } from "../../database/match.ts";

const matchApi: FastifyPluginAsync = async (fastify: any) => {
	fastify.post('/match', async (req: any, res: any) => {
		try
		{
			const jwt = await req.jwtVerify();
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

	fastify.get('/match/user', async (req: any, res: any) => {
		try
		{
			const jwt = await req.jwtVerify();
			const user_id = jwt.id;
			const user_matches = await getMatchByUserId(user_id);

			const matches_total = user_matches.length;
			const win_games = user_matches.filter((match: any) => match.winner_id == user_id).length;
			const lose_games = matches_total - win_games;
			const win_rate = Math.floor(win_games / matches_total * 100);

			const obj = { user_id, user_matches, win_games, lose_games, matches_total, win_rate };

			res.send({ obj });
		}
		catch (error)
			{
			res.status(401).send({ message: 'Unauthorize or Error getting match record' });
		}
	});
}

export default matchApi;
