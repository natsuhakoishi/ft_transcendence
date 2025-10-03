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
	fastify.post('/profile', async (req: any, res: any) => {
		try
		{
			const user = await getUserById(req.user);
			const profile = await getProfileById(req.user);
			if (!user || !profile)
				return res.status(404).send({ message: 'User or Profie Not Found' });

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
			res.status(401).send({ message: 'Invalid / Expired token to show profile' });
		}
	});

	fastify.post('/upload_avatar', async (req: any, res: any) => {
		try
		{
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
			res.status(500).send({ message: 'Failed to upload avatar' });
		}
	});

	fastify.post('/delete_avatar', async (req: any, res: any) => {
		try
		{
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
			res.status(401).send({ message: 'Error caused when deleting avatar' });
		}
	});

	fastify.post('/update_username', async (req: any, res: any) => {
		const new_username = req.body.username;
		const flag_checkname = await checkUsernameExist(new_username);

		if (flag_checkname)
			return res.status(400).send({ message: 'Username already taken' });
		await updateUsernameById(req.user, new_username);
		res.send({ message: 'Username changed successfully' });
	});

	fastify.post('/update_password', async (req: any, res: any) => {
		try
		{
			const user = await getUserById(req.user);
			const { old_password, new_password } = req.body;
			console.log(old_password, new_password);

			const checked = await verifyPassword(old_password, user.password);
			if (!checked)
				return res.code(400).send({ message: "Invalid old password" });

			const hashed_pw = await hashPassword(new_password);
			await updatePasswordById(req.user, hashed_pw);

			res.send({ message: 'Password changed successfully' });
		}
		catch (error)
		{
			console.log(error);
			res.status(400).send({ message: 'Error caused when update password' });
		}
	});
};

export default profileApi;
