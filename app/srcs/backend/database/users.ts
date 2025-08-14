import { runSQLite } from "./utils.ts";

export async function newUser(username: string, email: string, password: string)
{
	await runSQLite(
		'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
		username,
		email,
		password
	);
}


