import type { FastifyPluginAsync } from "fastify";
import { getUserById } from "../../database/user.ts";
import { addFriendbyId, checkFriendMutual, deleteFriendbyId, getFriendshipsById } from "../../database/friendship.ts";
import { getProfileById } from "../../database/profile.ts";

const friendshipApi: FastifyPluginAsync = async (fastify: any) =>
{
	fastify.post('/my_friends', async (req: any, res: any) => {
		try
		{
			const user_id = req.user;
			const user = await getUserById(req.user);
			const friends = await getFriendshipsById(req.user);
			if (!user)
				return res.status(404).send({ message: 'User not found'});
			else if (!friends || friends.length === 0)
				return res.send({ message: "Empty friend slot", friends: [] });

			const friends_detail = await Promise.all(friends.map(async (f: any) => {
				const friend_profile = await getProfileById(f.friend_id);
				const friend_mutual = await checkFriendMutual(req.user, f.friend_id);

				return {
					friend_profiles:
					{
						friend_id: friend_profile.id,
						friend_username: friend_profile.username,
						friend_avatar_path: friend_profile.avatar_path,
						friend_avatar_buffer: friend_profile.avatar_buffer?.toString("base64"),
						friend_avatar_buffer_exist: friend_profile.avatar_buffer ? true : false,
						friend_login_status: friend_profile.login_status,
						friend_win_games: friend_profile.win_games,
						friend_lose_games: friend_profile.lose_games,
						friend_tournament_wins: friend_profile.tournament_wins
					},
					friend_mutual: friend_mutual
				};
			}));
			return res.send({ friends: friends_detail });
		}
		catch (error: any)
		{
			res.status(401).send({ message: error.message || 'Unauthorize friendships' });
		}
	});

	fastify.post('/add_friend', async (req: any, res: any) => {
		try {
			// const user_id = req.user;
			const { friend_adding } = req.body as any;
			if (req.user === friend_adding)
				return res.status(400).send({ message: "Error: You cannot add yourself as a friend" });
			if (friend_adding < 1)
				return res.status(400).send({ message: "Error: Invalid ID" });
			await addFriendbyId(req.user, friend_adding);
			return res.send({ message: 'Friend added successfully' });
		}
		catch (error)
		{
			res.status(400).send({ message: 'Unauthorize add_friend' });
		}
	});

	fastify.post('/delete_friend', async (req: any, res: any) => {
		try {
			const user_id = req.user;
			const { friend_deleting } = req.body as any;
			await deleteFriendbyId(user_id, friend_deleting);
			return res.send({ message: 'Friend deleted successfully' });
		}
		catch (error)
		{
			res.status(400).send({ message: 'Unauthorize delete_friend' });
		}
	});
};

export default friendshipApi;
