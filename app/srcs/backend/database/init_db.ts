import { create_table } from "./create_table.ts";

export async function initDB()
{
	await create_table();
	console.log("Table create function called.");
}
