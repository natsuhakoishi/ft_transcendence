import type { FastifyPluginAsync } from "fastify";
import { bindMatchTournament, createTournament, getMatchesByTournamentId, getTournamentAll, getTournamentById, getTournamentLeaderboard, getTournamentParticipantsByTournamentId, joinTournament } from "../../database/tournament.ts";

const tournamentApi: FastifyPluginAsync = async (fastify: any) =>
{
	fastify.post('/tournament', async (req: any, res: any) => {
		try
		{
			const jwt = await req.jwtVerify();
			const host_id = jwt.id;
			const name = req.body.name as any;
			if (!name || typeof name !== 'string')
				return res.status(400).send({ message: 'Invalid tournament name' });
			await createTournament(name, host_id);
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
			const jwt = await req.jwtVerify();
			const { tournament_id } = req.body as any;
			const user_id = jwt.id;

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
			const jwt = await req.jwtVerify();
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
}

export default tournamentApi;
