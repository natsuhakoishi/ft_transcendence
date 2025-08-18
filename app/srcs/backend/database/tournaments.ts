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

export async function getMatchesByTournamentId(tournament_id: number)
{
	return await getSQLite(`
		SELECT matches.*
		FROM tournament_matches
		JOIN matches ON tournament_matches.match_id = matches.id
		WHERE tournament_matches.tournament_id = ?
		ORDER BY matches.game_time DESC`,
		[tournament_id]
	);
}
