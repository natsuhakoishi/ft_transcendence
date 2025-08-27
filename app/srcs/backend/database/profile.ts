import { getUserByUsername } from "./user.ts"
import { allSQLite, getSQLite, runSQLite } from "./utils.ts";

export async function createProfile(username: string)
{
	const user = await getUserByUsername(username);
	if (!user)
		throw new Error(`Error: User ${username} not found`);

	await runSQLite(`
		INSERT INTO profiles (id, username, login_status, win_games, lose_games, tournament_wins) VALUES (?, ?, ?, ?, ?, ?)`,
		user.id, user.username,
		false, 0, 0, 0
	);
}

export async function setLoginStatus(user_id: number, login_status: boolean)
{
	await runSQLite(`
		UPDATE profiles SET login_status = ? WHERE id = ?`,
		login_status,
		user_id
	);
}

export async function setAvatarPath(user_id: number, avatar_path: string, avatar_buffer?: any)
{
	await runSQLite(`
		UPDATE profiles SET avatar_path = ?, avatar_buffer = ? WHERE id = ?`,
		avatar_path,
		avatar_buffer,
		user_id
	);
}

export async function addWinLose(user_id: number, type: 'win_games' | 'lose_games' | 'tournament_wins')
{
	await runSQLite(`
		UPDATE profiles SET ${type} = ${type} + 1 WHERE id = ?`,
		user_id
	);
}

export async function getProfileById(user_id: number)
{
	return await getSQLite(`SELECT * FROM profiles WHERE id = ?`, [user_id]);
}

export async function getProfileByUsername(username: string)
{
	return await getSQLite(`SELECT * FROM profiles WHERE username = ?`,  [username]);
}

export async function getProfileByEmail(email: string)
{
	return await getSQLite(`SELECT * FROM profiles WHERE email = ?`,  [email]);
}

export async function getProfilesAll()
{
	return await allSQLite(`SELECT * FROM profiles ORDER BY id ASC`);
}

