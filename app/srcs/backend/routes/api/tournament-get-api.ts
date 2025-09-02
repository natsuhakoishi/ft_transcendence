import type { FastifyPluginAsync } from "fastify";
import { getMatchesByTournamentId, getTournamentAll, getTournamentById, getTournamentLeaderboard, getTournamentParticipantsByTournamentId } from "../../database/tournament.ts";

const tournamentGetApi: FastifyPluginAsync = async (fastify: any) => {
	fastify.get('/tournament', async (req: any, res: any) => {
		try
		{
			const tournaments = await getTournamentAll();
			res.send(tournaments);
		}
		catch (error)
		{
			res.status(500).send({ message: 'Error getting all tournaments' });
		}
	});

	fastify.get('/tournament/:id', async (req: any, res: any) => {
		const { id } = req.params as any;

		const t_id = parseInt(id);
		if (isNaN(t_id))
			return res.status(400).send({ message: 'Invalid tournament ID' });

		const tournament = await getTournamentById(t_id);
		if (!tournament)
			return res.status(404).send({ message: 'Tournament Not Found' });

		res.send(tournament);
	});

	fastify.get('/tournament/:id/participants', async (req: any, res: any) => {
		const { id } = req.params as any;

		const t_id = parseInt(id);
		if (isNaN(t_id))
			return res.status(400).send({ message: 'Invalid tournament ID' });

		const tournament = await getTournamentById(t_id);
		if (!tournament)
			return res.status(404).send({ message: 'Tournament Not Found' });

		const participants = await getTournamentParticipantsByTournamentId(t_id);
		res.send(participants);
	});

	fastify.get('/tournament/:id/matches', async (req: any, res: any) => {
		const { id } = req.params as any;

		const t_id = parseInt(id);
		if (isNaN(t_id))
			return res.status(400).send({ message: 'Invalid tournament ID' });

		const tournament = await getTournamentById(t_id);
		if (!tournament)
			return res.status(404).send({ message: 'Tournament Not Found' });

		const matches = await getMatchesByTournamentId(t_id);
		res.send(matches);
	});

	fastify.get('/tournament/:id/leaderboard', async (req: any, res: any) => {
		const { id } = req.params as any;

		const t_id = parseInt(id);
		if (isNaN(t_id))
			return res.status(400).send({ message: 'Invalid tournament ID' });

		const tournament = await getTournamentById(t_id);
		if (!tournament)
			return res.status(404).send({ message: 'Tournament Not Found' });

		const leaderboard = await getTournamentLeaderboard(t_id);
		res.send(leaderboard);
	});
};

export default tournamentGetApi;
