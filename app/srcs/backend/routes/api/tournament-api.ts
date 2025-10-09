import type { FastifyPluginAsync } from "fastify";
import { bindMatchTournament, createTournament, joinTournament, updateTournamentRank } from "../../database/tournament.ts";

const tournamentApi: FastifyPluginAsync = async (fastify: any) =>
{
	//didn't use?
	fastify.post('/tournament', async (req: any, res: any) => {
		try
		{
			const host_id = req.user;
			const name = req.body.name as any;
			if (!name || typeof name !== 'string')
				return res.status(400).send({ message: 'Invalid tournament name' });
			await createTournament(host_id);
			res.send({ message: 'Tournament created successfully' });
		}	
		catch (error)
		{
			res.status(401).send({ message: 'Unauthorized or Error creating tournament' });
		}
	});

	fastify.post('/tournament/join', async (req: any, res: any) => {
		try
		{
			const { tournament_id } = req.body as any;
			const user_id = req.user;

			const t_id = Number(tournament_id);
			if (isNaN(t_id))
				return res.status(400).send({ message: 'Invalid tournament_id or user_id' });

			await joinTournament(tournament_id, user_id);
			res.send({ message: 'Tournament joined successfully' });
		}
		catch (error)
		{
			res.status(401).send({ message: 'Unauthorized or Error joining tournament' });
		}
	});

	fastify.post('/tournament/bind_match', async (req: any, res: any) => {
		try
		{
			const user_id = req.user;
			const { tournament_id, match_id } = req.body as any;

			if (typeof tournament_id !== 'number' || typeof match_id !== 'number')
				return res.status(400).send({ message: 'Invalid tournament_id or match_id' });

			await bindMatchTournament(tournament_id, match_id);
			res.send({ message: 'Tournament-match binded successfully' });
		}
		catch (error)
		{
			res.status(401).send({ message: 'Unauthorized or Error binding match for tournament' });
		}
	});

	fastify.post('/tournament/update_ranking', async (req: any, res: any) => {
		try
		{
			const { tournament_id, leaderboard } = req.body;
			const ranks = [
				{ player: leaderboard.first, rank: 1 },
				{ player: leaderboard.second, rank: 2 },
				{ player: leaderboard.third, rank: 3 },
				{ player: leaderboard.last, rank: 4 },
			];

			for (const { player, rank } of ranks)
				await updateTournamentRank(tournament_id, player.id, rank);
			res.send({ message: 'Tournament ranking updated successfully' });
		}
		catch (error: any)
		{
			console.error('Error updating tournament ranks:', error);
			res.status(401).send({ message: 'Unauthorized when updating tournament ranking' });
		}
	});
};

export default tournamentApi;
