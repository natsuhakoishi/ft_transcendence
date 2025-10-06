import type { FastifyPluginAsync } from "fastify";
import { createMatch, getMatchByUserId } from "../../database/match.ts";
import type { MatchMeResponse, Match, TournamentMatch } from '../../share/type/history.ts';
import { getTournamentLeaderboard } from "../../database/tournament.ts";

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
			const matches = await getMatchByUserId(req.user);
			const toMatch = (match: any): Match => ({
				mode: match.tournament_id ? "tournament" : "match",
				match_id: match.id, game_time: match.game_time, winner_id: match.winner_id,
				player1: {
					user_id: match.player1_id, username: match.player1_username, score: match.player1_score, },
				player2: {
					user_id: match.player2_id, username: match.player2_username, score: match.player2_score, },
			});

			const user_matches: MatchMeResponse["user_matches"] = [];
			const tournament = new Map<number, TournamentMatch>();
			let count = 0;

			for (const match of matches) {
				if (count == 5) break;

				if (match.tournament_id)
				{
					let tournamentEntry = tournament.get(match.tournament_id);
					if (!tournamentEntry)
					{
						const leaderboard = await getTournamentLeaderboard(match.tournament_id);
						tournamentEntry = {
							// mode: "tournament",
							tournament: { id: match.tournament_id, start_time: match.game_time, twinner_id: leaderboard[0].id },
							matches: [],
						};
						tournament.set(match.tournament_id, tournamentEntry);
						user_matches.push(tournamentEntry);
						count++;
					}
					if (match.game_time < tournamentEntry.tournament.start_time)
						tournamentEntry.tournament.start_time = match.game_time;
					tournamentEntry.matches.push(toMatch(match));
				} else {
					user_matches.push(toMatch(match));
					count++;
				}
			}

			res.send({ user_id: req.user, user_matches });
		}
		catch (error)
		{
			res.status(401).send({ message: 'Unauthorize or Error getting match record' });
		}
	});
}

export default matchApi;
