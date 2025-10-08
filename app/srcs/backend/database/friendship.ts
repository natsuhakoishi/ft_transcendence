import { getSQLite, runSQLite, allSQLite } from "./utils.ts";

export async function addFriendbyId(user_id: number, friend_id: number)
{
	if (user_id === friend_id)
		throw new Error("Error: User unable to add themself");

	await runSQLite(`
		INSERT INTO friendships (user_id, friend_id) VALUES (?, ?)`,
		user_id, friend_id
	);
}

export async function deleteFriendbyId(user_id: number, friend_id: number)
{
	if (user_id === friend_id)
		throw new Error("Error: User unable to delete themself");

	const res = await runSQLite(`
		DELETE FROM friendships WHERE user_id = ? AND friend_id = ?`,
		user_id, friend_id
	);

	if (!res.changes || res.changes === 0)
		throw new Error("Error: Friendship doesn't exist");
}

export async function checkFriendMutual(user1_id: number, user2_id: number)
{
	const rows = await allSQLite(`
		SELECT COUNT(*) as c
		FROM friendships
		WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`,
		[user1_id, user2_id, user2_id, user1_id]
	);

	const found = rows[0].c;
	if (found === 2)
		return { mutual: true };
	else
		return { mutual: false };
}

export async function getFriendshipsAll()
{
	return await allSQLite(`SELECT * FROM friendships ORDER BY user_id ASC`);
}

export async function getFriendshipsById(user_id: number)
{
	return await allSQLite(`SELECT * FROM friendships WHERE user_id = ?`, [user_id]);
}
