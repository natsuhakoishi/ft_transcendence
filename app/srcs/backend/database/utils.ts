import sqlite3 from "sqlite3";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const dir_name = path.dirname(fileURLToPath(import.meta.url));
const db_path = path.join(dir_name, '..', '..', '..', '..', 'database');
if (!fs.existsSync(db_path))
	fs.mkdirSync(db_path, { recursive: true });

export const db = new sqlite3.Database(path.join(db_path, "klbq.db"), (error) => {
	if (error)
		console.error("Error: Failure: DB open");
	else
		console.log("Connected to SQLite DB");
});

export function execSQLite(sql:string): Promise<void>
{
	return new Promise((resolve, reject) => {
		db.exec(sql, (error) => {
			if (error)
				reject(error);
			else
				resolve();
		});
	});
}

export function getSQLite(sql:string, params: any[] = []): Promise<any>
{
	return new Promise((resolve, reject) => {
		db.get(sql, params, (error, row) => {
			if (error)
				reject(error);
			else
				resolve(row);
		});
	});
}

export function runSQLite(sql:string, ...params: any[]): Promise<{ changes: number, lastID: number }>
{
	return new Promise((resolve, reject) => {
		db.run(sql, params, function (error) {
			if (error)
				reject(error);
			else
				resolve({ changes: this.changes, lastID: this.lastID });
		});
	});
}

export function allSQLite(sql: string, params: any[] = []): Promise<any[]>
{
	return new Promise((resolve, reject) => {
		db.all(sql, params, (error, rows) => {
			if (error)
				reject(error);
			else
				resolve(rows);
		});
	});
}
