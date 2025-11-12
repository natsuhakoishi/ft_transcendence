import type { FastifyPluginAsync } from "fastify";
import type { Friends } from "../../share/type/friend.ts";
import { getUserById, getUserByUsername } from "../../database/user.ts";
import { addFriendbyId, checkFriendMutual, deleteFriendbyId, getFriendshipsById } from "../../database/friendship.ts";
import { getProfileById } from "../../database/profile.ts";
import validator from "validator";

const friendshipApi: FastifyPluginAsync = async (fastify: any) =>
{
	fastify.post('/my_friends', async (req: any, res: any) => {
		try
		{
			const user = await getUserById(req.user);
			if (!user)
				return res.status(404).send({ message: 'User not found'});

			const friends = await getFriendshipsById(req.user);
			if (!friends || friends.length === 0)
				return res.send({ friends: [], load: true });

			const friends_detail = await Promise.all(friends.map(async (f: any) => {
				const friend_profile = await getProfileById(f.friend_id);
				const friend_mutual = await checkFriendMutual(req.user, f.friend_id);

				return {
					info:
					{
						id: friend_profile.id,
						username: friend_profile.username,
						avatar_path: friend_profile.avatar_path,
						avatar_buffer: friend_profile.avatar_buffer?.toString("base64"),
						avatar_buffer_exist: friend_profile.avatar_buffer ? true : false,
						login_status: friend_profile.login_status,
						win_games: friend_profile.win_games,
						lose_games: friend_profile.lose_games,
						tournament_wins: friend_profile.tournament_wins
					},
					fstatus: friend_mutual
				} as Friends
			}));
			return res.send({ friends: friends_detail, load: true });
		}
		catch (error: any)
		{
			res.status(500).send({ message: 'Server Error: fetch friendships' });
		}
	});

	fastify.post('/add_friend', async (req: any, res: any) => {
		try {
			let { friend_adding } = req.body as any;

			if (!friend_adding)
				return res.status(500).send({ message: "Need username to add friend" });

			const friend = await getUserByUsername(friend_adding);
			if (!friend)
				return res.status(400).send({ code: "friend.ERR_NameInvalid", message: "Error: Invalid Username" });

			if (req.user === friend.id)
				return res.status(400).send({ code: "friend.ERR_AddF_Self", message: "Error: You cannot add yourself as a friend" });

			await addFriendbyId(req.user, friend.id);

			return res.send({ message: 'Friend added successfully' });
		}
		catch (error: any)
		{
			console.log(error.message);
			res.status(500).send({ message: 'Server Error: add friend' });
		}
	});

	fastify.post('/delete_friend', async (req: any, res: any) => {
		try {
			const user_id = req.user;
			const { friend_deleting } = req.body as any;
			await deleteFriendbyId(user_id, friend_deleting);
			return res.send({ message: 'Friend deleted successfully' });
		}
		catch (error: any)
		{
			res.status(500).send({ message: 'Server Error: delete friend' });
		}
	});
};

export default friendshipApi;
