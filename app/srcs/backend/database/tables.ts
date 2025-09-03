import { execSQLite } from "./utils.ts";

export async function initDB()
{
	await createTable();
	console.log("Table create function called.");
}

export async function createTable()
{
	// --- USERS TABLE ---
	await execSQLite(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT UNIQUE NOT NULL,
			email TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			google_login_flag BOOLEAN DEFAULT 0,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP
		);
	`);

	// --- PROFILE TABLE ---

	await execSQLite(`
		CREATE TABLE IF NOT EXISTS profiles (
			id INTEGER PRIMARY KEY,
			username TEXT UNIQUE NOT NULL,
			avatar_path TEXT DEFAULT 'default.webp',
			avatar_buffer BLOB,
			login_status BOOLEAN DEFAULT 0,
			win_games INTEGER DEFAULT 0,
			lose_games INTEGER DEFAULT 0,
			tournament_wins INTEGER DEFAULT 0,
			FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
		);
	`);

	// --- MATCHES TABLE ---

	await execSQLite(`
		CREATE TABLE IF NOT EXISTS matches (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			player1_id INTEGER NOT NULL,
			player2_id INTEGER NOT NULL,
			player1_score INTEGER NOT NULL,
			player2_score INTEGER NOT NULL,
			winner_id INTEGER,
			tournament_flag BOOLEAN DEFAULT 0,
			game_time TEXT DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (winner_id) REFERENCES users(id)
		);
	`);

	// --- TOURNAMENT TABLE ---

	await execSQLite(`
		CREATE TABLE IF NOT EXISTS tournaments (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			host_id INTEGER NOT NULL,
			status TEXT CHECK(status IN ('waiting', 'on-going', 'completed')) DEFAULT 'waiting',
			start_time DATETIME,
			end_time DATETIME,
			FOREIGN KEY (host_id) REFERENCES users(id)
		);
	`);

	await execSQLite(`
		CREATE TABLE IF NOT EXISTS tournament_participants (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			tournament_id INTEGER NOT NULL,
			user_id INTEGER NOT NULL,
			FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			UNIQUE (tournament_id, user_id)
		);
	`);

	await execSQLite(`
		CREATE TABLE IF NOT EXISTS tournament_matches (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			tournament_id INTEGER NOT NULL,
			match_id INTEGER NOT NULL,
			FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
			FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
		);
	`);

	// --- FRIENDSHIP TABLE ---

	await execSQLite(`
		CREATE TABLE IF NOT EXISTS friendships (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			friend_id INTEGER NOT NULL,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
			CHECK (user_id != friend_id),
			UNIQUE (user_id, friend_id)
		);
	`);

	console.log("DB Schema and Table Created.")
}
