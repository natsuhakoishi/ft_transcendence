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

export async function getUserByEmail(email: string)
{
	return await getSQLite(`SELECT * FROM users WHERE email = ?`, [email]);
}

export async function getUserById(id: string)
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
