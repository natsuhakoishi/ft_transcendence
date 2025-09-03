import { allSQLite, getSQLite, runSQLite } from "./utils.ts";

export async function createUser(username: string, email: string, password: string)
{
	await runSQLite(
		`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
		username,
		email,
		password
	);
}

export async function createUserByGoogle(username: string, email: string, password: string)
{
	await runSQLite(
		`INSERT INTO users (username, email, password, google_login_flag) VALUES (?, ?, ?, ?)`,
		username,
		email,
		password,
		true
	);
}

export async function getUserByEmail(email: string)
{
	return await getSQLite(`SELECT * FROM users WHERE email = ?`, [email]);
}

export async function getUserById(id: number)
{
	return await getSQLite(`SELECT * FROM users WHERE id = ?`, [id]);
}

export async function getUserByUsername(username: string)
{
	return await getSQLite(`SELECT * FROM users WHERE username = ?`, [username]);
}

export async function getUserAll()
{
	return await allSQLite(`SELECT * FROM users ORDER BY created_at DESC`);
}

export async function checkUsernameExist(username: string)
{
	const res = await getSQLite(`SELECT id FROM users WHERE username = ?`, [username]);
	return (res !== undefined) ? true : false;
}

export async function updateUsernameById(id: number, new_username: string)
{
	return await runSQLite(`UPDATE users SET username = ? WHERE id = ?`, new_username, id);
}

export async function updatePasswordById(id: number, new_password: string)
{
	return await runSQLite(`UPDATE users SET password = ? WHERE id = ?`, new_password, id);
}
