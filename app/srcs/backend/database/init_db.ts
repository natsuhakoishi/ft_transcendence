import { createTable } from "./tables.ts";

export async function initDB()
{
	await createTable();
	console.log("Table create function called.");
}
