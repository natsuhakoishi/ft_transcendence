import type { FastifyPluginAsync } from "fastify";
import { createMatch, getMatchByUserId } from "../../database/match.ts";
import type { MatchMeResponse } from '../../share/type/history.ts';

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
			const result = await getMatchByUserId(req.user);

			const response : MatchMeResponse =
			{
				user_id: req.user,
				user_matches: result.map((match: any) => (
				{
					match_id: match.id,
					game_time: match.game_time,
					winner_id: match.winner_id,
					player1:
					{
						user_id: match.player1_id,
						username: match.player1_username,
						score: match.player1_score,
					},
					player2:
					{
						user_id: match.player2_id,
						username: match.player2_username,
						score: match.player2_score,
					},
					tournament:
					{
						id: match.tournament_id,
					},
				})),
			};

			res.send(response);
		}
		catch (error)
			{
			res.status(401).send({ message: 'Unauthorize or Error getting match record' });
		}
	});
}

export default matchApi;
