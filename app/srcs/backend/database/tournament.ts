import { runSQLite, getSQLite, allSQLite } from "./utils.ts";

export async function createTournament(host_id: number): Promise<number>
{
	await runSQLite(`
		INSERT INTO tournaments (host_id) VALUES (?)`,
		host_id
	);

	const result = await runSQLite(`SELECT last_insert_rowid() as id`);
	await setTournamentStatus(result.lastID, "waiting");
	return result.lastID;
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
		INSERT OR IGNORE INTO tournament_participants (tournament_id, user_id, rank) VALUES (?, ?, 0)`,
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
			users.id,
			users.username,
			profiles.avatar_path,
			rank
		FROM tournament_participants
		JOIN users ON tournament_participants.user_id = users.id
		JOIN profiles ON users.id = profiles.id
		WHERE tournament_participants.tournament_id = ?
		ORDER BY tournament_participants.rank ASC
		`,
		[tournament_id]
	);
}

export async function updateTournamentRank(tournament_id: number, new_rank: number, user_id: number)
{
	await runSQLite(
		`UPDATE tournament_participants 
		SET rank = ? 
		WHERE tournament_id = ? AND user_id = ?`,
		new_rank, tournament_id, user_id
	);
}

export async function setTournamentStatus(tournament_id: number, status: 'waiting' | 'on-going' | 'completed')
{
	await runSQLite(`UPDATE tournaments SET status = ? WHERE id = ?`, status, tournament_id);
}

