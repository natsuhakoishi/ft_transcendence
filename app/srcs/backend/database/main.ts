import { initDB } from "./init_db.ts";

async function main() {
	try {
		await initDB();
		console.log("Main called.");
	}
	catch (error)
	{
		console.log("Main error.");
	}
}

main();
