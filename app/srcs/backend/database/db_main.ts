import { initDB } from "./tables.ts";
import { createUser, getUserAll, updateUsernameById } from "./user.ts";
import { createMatch, getMatchAll, getMatchByUserId } from "./match.ts";
import { bindMatchTournament, createTournament, getMatchesByTournamentId, getTournamentAll, getTournamentLeaderboard, getTournamentParticipantsByTournamentId, joinTournament } from "./tournament.ts";
import { addWinLose, createProfile, getProfilesAll } from "./profile.ts";
import { addFriendbyId, checkFriendMutual, getFriendshipsAll, getFriendshipsById } from "./friendship.ts";

async function main()
{
	// //init
	// try {
	// 	await initDB();
	// 	console.log("DB initialized.");
	// }
	// catch (error)
	// {
	// 	console.log("DB error initialize");
	// }

	//make user
	try {
		// await createUser("Nijika", "nijika@yippie.com", "12345678");
		// await createUser("Ryo", "ryo@yippie.com", "87654321");
		// await createUser("Kita", "kita@yippie.com", "77777777");
		// await createUser("Bocchi", "hitori@yippie.com", "11111111");

		// const users = await getUserAll();
		// console.log("All Users:", users);

		// await updateUsernameById(1, "labubu");
		// const users2 = await getUserAll();
		// console.log("All Users:", users2);
		// const match = await getMatchAll();

		// console.log(match);

		const data = await createTournament(1);
		console.log(data);
		console.log(await getTournamentAll());
	}
	catch (error)
	{
		console.log("User part error: ", error);
	}

	// //make profiles
	// try {
	// // 	await createProfile("Nijika");
	// // 	await createProfile("Ryo");
	// // 	await createProfile("Kita");
	// // 	await createProfile("Bocchi");

	// 	const profiles = await getProfilesAll();
	// 	console.log("Profiles: ", profiles);
	// }
	// catch (error)
	// {
	// 	console.log("Profile error: ", error);
	// }

	// //make matches
	// try {
	// 	await createMatch(1, 2, 5, 4);
	// 	await addWinLose(1, "win_games");
	// 	await addWinLose(2, "lose_games");
	// 	await createMatch(3, 4, 1, 5);
	// 	await addWinLose(4, "win_games");
	// 	await addWinLose(3, "lose_games");

	// 	const matches = await getMatchAll();
	// 	console.log("All matches:", matches);
	// }
	// catch (error)
	// {
	// 	console.log("Match part error: ", error);
	// }

	// //tournament part
	// try {
	// 	await createTournament("BTR tourney 1", 1);

	// 	await joinTournament(1, 1);
	// 	await joinTournament(1, 2);
	// 	await joinTournament(1, 3);
	// 	await joinTournament(1, 4);

	// 	const tournaments = await getTournamentAll();
	// 	const t_p = await getTournamentParticipantsByTournamentId(1);
	// 	console.log("All tourney:", tournaments);
	// 	console.log("Tourney Participant in tourney 1: ", t_p);

	// 	await createMatch(1, 3, 5, 1, true);
	// 	// await addWinLose(1, "win_games");
	// 	// await addWinLose(3, "lose_games");
	// 	await bindMatchTournament(1, 3);
	// 	await createMatch(2, 4, 1, 5, true);
	// 	// await addWinLose(4, "win_games");
	// 	// await addWinLose(2, "lose_games");
	// 	await bindMatchTournament(1, 4);
	// 	await createMatch(2, 3, 5, 1, true);
	// 	// await addWinLose(2, "win_games");
	// 	// await addWinLose(3, "lose_games");
	// 	await bindMatchTournament(1, 5);
	// 	await createMatch(1, 4, 5, 2, true);
	// 	// await addWinLose(1, "win_games");
	// 	// await addWinLose(4, "lose_games");
	// 	// await addWinLose(1, "tournament_wins");
	// 	await bindMatchTournament(1, 6);

	// 	const match_raw = await getMatchesByTournamentId(1, "raw");
	// 	const match_detail = await getMatchesByTournamentId(1, "detail");
	// 	const tourney = await getTournamentLeaderboard(1);
	// 	console.log("Match Raw Data: ", match_raw);
	// 	console.log("Match Detail Data: ", match_detail);
	// 	console.log("Tourney Leaderboard: ", tourney);
	// 	await addWinLose(1, "tournament_wins");
	// }
	// catch (error)
	// {
	// 	console.log("Tournament part error: ", error);
	// }

	// //final profile check
	// try {
	// 	const profiles = await getProfilesAll();
	// 	console.log("Latest Profiles: ", profiles);
	// }
	// catch (error)
	// {
	// 	console.log("Profile error: ", error);
	// }

	// try {
	// 	await addFriendbyId(1, 2);
	// 	const checkMutual = await checkFriendMutual(1, 2);
	// 	console.log("Mutual Status: ", checkMutual);

	// 	await addFriendbyId(2, 1);
	// 	const checkMutual2 = await checkFriendMutual(1, 2);
	// 	console.log("Mutual Status: ", checkMutual2);

	// 	await addFriendbyId(1, 3);
	// 	await addFriendbyId(1, 4);
	// 	await addFriendbyId(3, 4);

	// 	const fsh = await getFriendshipsAll();
	// 	console.log("Friendships Table: ", fsh);

	// 	const fsh2 = await getFriendshipsById(1);
	// 	console.log("User 1 friendships Table: ", fsh2);
	// }
	// catch (error)
	// {
	// 	console.log("Friendships error: ", error);
	// }
}

main();
