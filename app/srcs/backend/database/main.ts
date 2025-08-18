import { initDB } from "./init_db.ts";
import { createUser, getUserAll } from "./users.ts";
import { createMatch, getMatchAll, getMatchByUserId } from "./matches.ts";
import { createTournament, getTournamentAll, getTournamentParticipantsByTournamentId, joinTournament } from "./tournaments.ts";

async function main()
{
	//init
	try {
		await initDB();
		console.log("DB initialized.");
	}
	catch (error)
	{
		console.log("DB error initialize");
	}

	//make user
	try {
		await createUser("Nijika", "nijika@yippie.com", "12345678");
		await createUser("Ryo", "ryo@yippie.com", "87654321");
		await createUser("Kita", "kita@yippie.com", "77777777");
		await createUser("Bocchi", "hitori@yippie.com", "11111111");

		const users = await getUserAll();
		console.log("All Users:", users);
	}
	catch (error)
	{
		console.log("User part error: ", error);
	}

	//make matches
	try {
		await createMatch(1, 2, 5, 4);
		await createMatch(3, 4, 1, 5);

		const matches = await getMatchAll();
		console.log("All matches:", matches);

		const nijika_match = await getMatchByUserId(1);
		console.log("Nijika matches:", nijika_match);
	}
	catch (error)
	{
		console.log("Match part error: ", error);
	}

	//tournament part
	try {
		await createTournament("BTR tourney 1", 1);

		await joinTournament(1, 1);
		await joinTournament(1, 2);
		await joinTournament(1, 3);
		await joinTournament(1, 4);

		const tournaments = await getTournamentAll();
		const t_p = await getTournamentParticipantsByTournamentId(1);
		console.log("All tourney:", tournaments);
		console.log("Tourney Participant in tourney 1: ", t_p);
	}
	catch (error)
	{
		console.log("Tournament part error: ", error);
	}
}

main();
