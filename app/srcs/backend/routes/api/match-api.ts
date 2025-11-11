import type { FastifyPluginAsync } from "fastify";
import { getMatchByUserId } from "../../database/match.ts";
import type { MatchMeResponse, Match, TournamentMatch } from '../../share/type/history.ts';
import { getTournamentLeaderboard } from "../../database/tournament.ts";
import { getUserById } from "../../database/user.ts";
import { getProfileById } from "../../database/profile.ts";

const matchApi: FastifyPluginAsync = async (fastify: any) => {
	fastify.get('/match/:id', async (req: any, res: any) => {
		try
		{
			if (!req.user)
				return res.status(401).send({ message: 'Unauthorized: missing token' });

			const { id } = req.params;
			const user = await getUserById(id);
			if (!user)
				return res.status(404).send({ message: 'User Not Found' });
			const profile = await getProfileById(id);
			if (!profile)
				return res.status(404).send({ message: 'Profie Not Found' });

			const matches = await getMatchByUserId(id);
			// console.log(matches);
			const toMatch = (match: any): Match => ({
				mode: match.tournament_id ? "tournament" : "match",
				match_id: match.id,
				game_time: match.game_time,
				winner_id: match.winner_id,
				player1: {
					user_id: match.player1_id, username: match.player1_username, score: match.player1_score, avatar_path: match.player1_avatar_path },
				player2: {
					user_id: match.player2_id, username: match.player2_username, score: match.player2_score, avatar_path: match.player2_avatar_path},
			});

			const user_matches: MatchMeResponse["user_matches"] = [];
			const tournament = new Map<number, TournamentMatch>();
			let count = 0;

			for (const match of matches) {
				if (count == 6) break;
				if (match.tournament_id)
				{
					let tournamentEntry = tournament.get(match.tournament_id);
					if (!tournamentEntry)
					{
						const leaderboard = await getTournamentLeaderboard(match.tournament_id);
						if (!leaderboard)
							return res.status(500).send({ message: `Fail to fetch leaderboard with tournament ${match.tournament_id}` });
						tournamentEntry = {
							// mode: "tournament",
							tournament: { id: match.tournament_id, start_time: match.game_time, first: leaderboard[0], second: leaderboard[1], third: leaderboard[2], last: leaderboard[3] },
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
			if (count == 6)
				user_matches.pop();
			res.send({ user_id: id, user_matches, message: "Match history get successfully" });
		}
		catch (error)
		{
			res.status(500).send({ message: 'Server Error: getting match record(me)' });
		}
	});
}

export default matchApi;
