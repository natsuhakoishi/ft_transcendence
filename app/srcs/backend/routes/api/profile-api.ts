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
	const ping_interval = 1000 * 45;
	const timeout = 1000 * 80;
	const onlineUsers = new Map();

	const ping = setInterval(() => {
		const now = Date.now();

		for (const [id, entry] of onlineUsers.entries()) {
			const { ws, username, lastPong } = entry;

			// if too long since last pong, kill connection
			if (now - (lastPong ?? 0) > timeout) {
				console.log(`\n[Timeout] User ${id ?? "?"} (${username ?? "?"})`);
				ws.terminate();
				onlineUsers.delete(id);
				continue;
			}

			// send ping to client
			try {
				ws.send(JSON.stringify({ type: "ping" }));
			} catch {
				console.log(`\n[Error] Failed to ping ${username}`);
				ws.terminate();
				onlineUsers.delete(id);
			}
		}
	}, ping_interval);

	fastify.get('/online', { websocket: true }, (connection: any) => {
		const ws = connection;
		let user: number;
		let name: string;

		ws.on("message", (msg: any) => {
			const data = JSON.parse(msg.toString());
			switch (data.type) {

				case "init":
					if (!data.id || !data.username) {
						ws.send(JSON.stringify({ type: "error", message: "missing data" }));
						return ;
					}
					console.log(`\nOnline Socket is up - ${new Date().toLocaleString('en-MY', {timeZone: 'Asia/Kuala_Lumpur'})}`);
					console.log(`Welcome, ${data.username}. Current Online:`);

					user = data.id;
					name = data.username;

					//duplicate connection hm
					if (onlineUsers.has(user)) {
						const prev = onlineUsers.get(user);
						prev.ws.close();
					}
					onlineUsers.set(user, { username: data.username, lastPong: Date.now(), ws });

					//log Fastify console
					for (const [user, info] of onlineUsers.entries()) {
						console.log(`${user}: ${info.username}`);
					}
					console.log("\n");

					ws.send(JSON.stringify({
						type: "init",
						// list: Array.from(onlineUsers.entries()).map(([id, { username }]) => ({ id, username }))
						list: Array.from(onlineUsers.entries()).map(([id]) => id)
					}));
					return ;
				
				case "pong":
					console.log("I get pong aaw\n");
					const entry = onlineUsers.get(user);
					if (entry)
						entry.lastPong = Date.now();
					return ;

				case "update":
					console.log("Huh from update");
					ws.send(JSON.stringify({
						type: "update",
						list: Array.from(onlineUsers.entries()).map(([id, { username }]) => ({ id, username }))
					}));
					return ;
			
				case "log_out":
					if (!user) return ;
					console.log(`Log out - Goodby ${name ?? "who"}\n`);
					onlineUsers.delete(user);
					clearInterval(ping);
					return ;
			}
		});

		ws.on("close", () => {
			console.log(`\nOnline Socket is closed - ${new Date().toLocaleString('en-MY', {timeZone: 'Asia/Kuala_Lumpur'})}`);
			console.log(`Goodbye ${name ?? "who"}\n`);
			if (user)
				onlineUsers.delete(user);
			clearInterval(ping);
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
