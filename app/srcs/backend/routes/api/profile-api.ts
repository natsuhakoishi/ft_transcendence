import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import type { FastifyPluginAsync } from "fastify";
import { checkUsernameExist, getUserById, updatePasswordById, updateUsernameById } from "../../database/user.ts";
import { getProfileById, setAvatarPath } from "../../database/profile.ts";
import { hashPassword, verifyPassword } from './auth-helper/pwHash.ts';
import type { User } from '../../share/type/user.ts';

const profileApi: FastifyPluginAsync = async(fastify: any) => {
	const onlineUsers = new Map(); 

	fastify.get('/online', { websocket: true }, (connection: any, req: any) => {
		const ws = connection;
		let user: number;

		ws.on("message", (msg: any) => {
			const data = JSON.parse(msg.toString());
			console.log("/online: received\n",data);

			// if (!data.user || !data.friends) {
			// 	ws.send(JSON.stringify({ type: "error", message: "missing data" }));
			// 	return ;
			// }

			if (data.type === "init")
			{
				user = data.user;
				const friends = new Set(data.friends || []);

				//duplicate connection hm
				if (onlineUsers.has(user)) {
					const prev = onlineUsers.get(user);
					prev.ws.close();
				}

				onlineUsers.set(user, { ws, friends });

				const onlineFriend = [];
				for (const id of friends) {
					if (onlineUsers.has(id))
						onlineFriend.push(id);
				}
				ws.send(JSON.stringify({ type: "init", list: onlineFriend }));
				return ;
			}
			
			if (data.type === "ping")
			{
				//implement later
				ws.send(JSON.stringify({ type: "pong" }));
				return ;
			}

			if (data.type === "update")
			{
				if (!user) return ;

				const entry = onlineUsers.get(user);
				if (!entry) return ;

				entry.friends = new Set(data.friends || []);
				const onlineFriend = [];
				for (const id of entry.friends) {
					if (onlineUsers.has(id))
						onlineFriend.push(id);
				}
				ws.send(JSON.stringify({ type: "update", list: onlineFriend }));
				return ;
			}
		});

		ws.on("close", () => {
			if (!user) return ;
			console.log("/online: player offline, id: ", user);
			onlineUsers.delete(user);
		});

	});

	fastify.post('/profile', async (req: any, res: any) => {
		try
		{
			if (!req.user)
				return res.status(401).send({ message: 'Unauthorized: missing token' });

			const user = await getUserById(req.user);
			if (!user)
				return res.status(404).send({ message: 'User Not Found' });
			const profile = await getProfileById(req.user);
			if (!profile)
				return res.status(404).send({ message: 'Profie Not Found' });

			const response: User =
			{
				acc:
				{
					user_id: user.id,
					username: user.username,
					email: user.email,
					google_login: user.google_login_flag,
					created_at: user.created_at
				},
				profile:
				{
					avatar_path: profile.avatar_path,
					avatar_buffer: profile.avatar_buffer?.toString("base64"),
					avatar_buffer_exist: profile.avatar_buffer ? true : false,
					login_status: profile.login_status,
					win_games: profile.win_games,
					lose_games: profile.lose_games,
					total_game: profile.matches_total,
					win_rate: Math.floor(profile.win_games / profile.matches_total * 100),
					tournament_wins: profile.tournament_wins
				}
			}
			res.send(response);
		}
		catch (error)
		{
			res.status(500).send({ message: 'Server Error: show profile' });
		}
	});

	fastify.post('/upload_avatar', async (req: any, res: any) => {
		try
		{
			if (!req.user)
				return res.status(401).send({ message: 'Unauthorized: missing token' });

			const data = await req.file();
			if (!data)
				return res.status(400).send({ message: 'No file uploaded' });

			const type = path.extname(data.filename);
			const allowed_type = ['.webp', '.jpg', '.jpeg', '.png'];
			if (!allowed_type.includes(type.toLowerCase()))
				return res.status(400).send({ message: 'Invalid file type' });

			const dir_name = path.dirname(fileURLToPath(import.meta.url));
			const dir = path.join(dir_name, '..', '..', 'assets', 'avatars');
			if (!fs.existsSync(dir))
				fs.mkdirSync(dir, { recursive: true });

			const fileName = `user_${req.user}_${Date.now()}.webp`;
			const uploadPath = path.join(dir, fileName);

			const chunks: Buffer[] = [];
			for await (const chunk of data.file)
				chunks.push(chunk);
			const buffer = Buffer.concat(chunks);

			const compressed = await sharp(buffer).resize(256, 256, { fit: 'cover', position: 'center' }).webp({ quality: 75 }).toBuffer();
			await setAvatarPath(req.user, fileName, compressed);
			await fs.promises.writeFile(uploadPath, compressed);
			res.send({ message: 'Avatar uploaded successfully', path: `/avatars/${fileName}`});
		}
		catch (error)
		{
			res.status(500).send({ message: 'Server Error: upload avatar' });
		}
	});

	fastify.post('/delete_avatar', async (req: any, res: any) => {
		try
		{
			if (!req.user)
				return res.status(401).send({ message: 'Unauthorized: missing token' });

			const profile = await getProfileById(req.user);
			if (profile.avatar_path && profile.avatar_path !== 'default.webp')
			{
				const dir_name = path.dirname(fileURLToPath(import.meta.url));
				const filePath = path.join(dir_name, '..', '..', 'assets', 'avatars', profile.avatar_path);

				if (fs.existsSync(filePath))
					fs.unlinkSync(filePath);
			}
			await setAvatarPath(req.user, 'default.webp');
			res.send({ message: 'Avatar deleted successfully' });
		}
		catch (error)
		{
			res.status(500).send({ message: 'Server Error: delete avatar' });
		}
	});

	fastify.post('/update_username', async (req: any, res: any) => {
		if (!req.user)
			return res.status(401).send({ message: 'Unauthorized: missing token' });

		try
		{
			const new_username = req.body.username;
			const flag_checkname = await checkUsernameExist(new_username);

			if (flag_checkname)
				return res.status(400).send({ code: "ERR_NameRepeat", message: 'Username already taken' });
			await updateUsernameById(req.user, new_username);
			res.send({ message: 'Username changed successfully' });
		}
		catch (error)
		{
			res.status(500).send({ message: 'Server Error: update username' });
		}
	});

	fastify.post('/update_password', async (req: any, res: any) => {
		try
		{
			if (!req.user)
				return res.status(401).send({ message: 'Unauthorized: missing token' });

			const user = await getUserById(req.user);
			const { old_password, new_password } = req.body;
			console.log(old_password, new_password);

			const checked = await verifyPassword(old_password, user.password);
			if (!checked)
				return res.code(400).send({ code:"ERR_PassVerifyFail", message: "Invalid old password" });

			const hashed_pw = await hashPassword(new_password);
			await updatePasswordById(req.user, hashed_pw);

			res.send({ message: 'Password changed successfully' });
		}
		catch (error)
		{
			console.log(error);
			res.status(500).send({ message: 'Server Error: update password' });
		}
	});
};

export default profileApi;
