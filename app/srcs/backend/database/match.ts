import { addWinLose } from "./profile.ts";
import { runSQLite, allSQLite, getSQLite } from "./utils.ts";

export async function createMatch(player1_id: number, player2_id: number, player1_score: number, player2_score: number, tournament_flag: boolean = false): Promise<number>
{
	const winner_id = player1_score > player2_score ? player1_id : player2_score > player1_score ? player2_id : null;

	await runSQLite(`
		INSERT INTO matches (
			player1_id, player2_id,
			player1_score, player2_score,
			winner_id, tournament_flag
		) VALUES (?, ?, ?, ?, ?, ?)`,
		player1_id,
		player2_id,
		player1_score,
		player2_score,
		winner_id,
		tournament_flag
	);

	if (!tournament_flag)
	{
		if (winner_id === player1_id)
		{
			addWinLose(player1_id, "win_games");
			addWinLose(player2_id, "lose_games");
		}
		else
		{
			addWinLose(player2_id, "win_games");
			addWinLose(player1_id, "lose_games");
		}
	}

	const result = await runSQLite(`SELECT last_insert_rowid() as id`);
	return result.lastID;
}

export async function getMatchById(match_id: number)
{
	return await getSQLite(`SELECT * FROM matches WHERE id = ?`, [match_id]);
}

export async function getMatchAll()
{
	return await allSQLite(`SELECT * FROM matches ORDER BY game_time DESC`);
}

export async function getMatchByUserId(user_id: number)
{
	return allSQLite(`
		SELECT matches.*,
			user1.username AS player1_username,
			profiles1.avatar_path AS player1_avatar_path,
			user2.username AS player2_username,
			profiles2.avatar_path AS player2_avatar_path,
			tournament_matches.tournament_id
		FROM matches
		JOIN users AS user1 ON matches.player1_id = user1.id
		JOIN profiles AS profiles1 ON profiles1.id = matches.player1_id
		JOIN users AS user2 ON matches.player2_id = user2.id
		JOIN profiles AS profiles2 ON profiles2.id = matches.player2_id
		LEFT JOIN tournament_matches ON matches.id = tournament_matches.match_id
		WHERE matches.player1_id = ? OR matches.player2_id = ?
		ORDER BY matches.game_time DESC`,
		[user_id, user_id]
	);
}
