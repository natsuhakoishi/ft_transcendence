import { runSQLite, getSQLite, allSQLite } from "./utils.ts";

export async function createTournament(name: string, host_id: number)
{
	await runSQLite(`
		INSERT INTO tournaments (name, host_id) VALUES (?, ?)`,
		name,
		host_id
	);
}

export async function getTournamentById(tournament_id: number)
{
	return await getSQLite(`SELECT * FROM tournaments WHERE id = ?`, [tournament_id]);
}

export async function getTournamentAll()
{
	return await allSQLite(`SELECT * FROM tournaments ORDER BY start_time DESC`);
}

export async function joinTournament(tournament_id: number, user_id: number)
{
	await runSQLite(`
		INSERT OR IGNORE INTO tournament_participants (tournament_id, user_id) VALUES (?, ?)`,
		tournament_id,
		user_id
	);
}

export async function getTournamentParticipantsByTournamentId(tournament_id: number)
{
	return await allSQLite(`
		SELECT users.id, users.username
		FROM tournament_participants
		JOIN users ON users.id = tournament_participants.user_id
		WHERE tournament_id = ?`,
		[tournament_id]
	);
}

export async function bindMatchTournament(tournament_id: number, match_id: number)
{
	await runSQLite(`
		INSERT INTO tournament_matches (tournament_id, match_id) VALUES (?, ?)`,
		tournament_id,
		match_id
	);
}

export async function getMatchesByTournamentId(tournament_id: number, type: "raw" | "detail" = "detail")
{
	if (type === "raw")
	{
		return await allSQLite(`
			SELECT matches.*
			FROM tournament_matches
			JOIN matches ON tournament_matches.match_id = matches.id
			WHERE tournament_matches.tournament_id = ?
			ORDER BY matches.game_time DESC`,
			[tournament_id]
		);
	}

	return await allSQLite(`
		SELECT
			matches.id AS match_id,
			matches.game_time,
			user1.username AS player1,
			user2.username AS player2,
			matches.player1_score,
			matches.player2_score,
			CASE
				WHEN matches.winner_id = user1.id THEN user1.username
				WHEN matches.winner_id = user2.id THEN user2.username
				ELSE 'Game On-going'
			END AS winner
		FROM tournament_matches
		JOIN matches ON tournament_matches.match_id = matches.id
		JOIN users user1 ON user1.id = matches.player1_id
		JOIN users user2 ON user2.id = matches.player2_id
		WHERE tournament_matches.tournament_id = ?
		ORDER BY matches.game_time ASC`,
		[tournament_id]
	);
}

export async function getTournamentLeaderboard(tournament_id: number)
{
	return allSQLite(`
		SELECT
			users.id, users.username,
			profiles.win_games, profiles.lose_games, profiles.tournament_wins,
			SUM(CASE WHEN matches.winner_id = users.id THEN 1 ELSE 0 END) AS match_wins,
			COUNT(matches.id) AS matches_played
		FROM tournament_participants
		JOIN users ON tournament_participants.user_id = users.id
		JOIN profiles ON users.id = profiles.id
		LEFT JOIN tournament_matches ON tournament_matches.tournament_id = tournament_participants.tournament_id
		LEFT JOIN matches ON matches.id = tournament_matches.match_id AND (matches.player1_id = users.id OR matches.player2_id = users.id)
		WHERE tournament_participants.tournament_id = ?
		GROUP BY users.id
		ORDER BY tm_wins DESC
		`,
		[tournament_id]
	);
}

