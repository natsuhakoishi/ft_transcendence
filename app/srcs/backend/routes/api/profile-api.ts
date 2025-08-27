import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import type { FastifyPluginAsync } from "fastify";
import { getUserById } from "../../database/user.ts";
import { getProfileById, setAvatarPath } from "../../database/profile.ts";


const profileApi: FastifyPluginAsync = async(fastify: any) => {
	fastify.post('/profile', async (req: any, res: any) => {
		try
		{
			const jwt = await req.jwtVerify();
			const user = await getUserById(jwt.id);
			const profile = await getProfileById(jwt.id);
			if (!user || !profile)
				return res.status(404).send({ message: 'User or Profie Not Found' });

			res.send({
				user:
				{
					username: user.username,
					email: user.email,
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
					tournament_wins: profile.tournament_wins
				}
			})
		}
		catch (error)
		{
			res.status(401).send({ message: 'Invalid or Expired token' });
		}
	});

	fastify.post('/upload_avatar', async (req: any, res: any) => {
		try
		{
			const jwt = await req.jwtVerify();
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

			const fileName = `user_${jwt.id}_${Date.now()}.webp`;
			const uploadPath = path.join(dir, fileName);

			const chunks: Buffer[] = [];
			for await (const chunk of data.file)
				chunks.push(chunk);
			const buffer = Buffer.concat(chunks);

			const compressed = await sharp(buffer).resize(256, 256, { fit: 'cover', position: 'center' }).webp({ quality: 75 }).toBuffer();
			await setAvatarPath(jwt.id, fileName, compressed);
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
			const jwt = await req.jwtVerify();
			const profile = await getProfileById(jwt.id);

			if (profile.avatar_path && profile.avatar_path !== 'default.webp')
			{
				const dir_name = path.dirname(fileURLToPath(import.meta.url));
				const filePath = path.join(dir_name, '..', '..', 'assets', 'avatars', profile.avatar_path);

				if (fs.existsSync(filePath))
					fs.unlinkSync(filePath);
			}
			await setAvatarPath(jwt.id, 'default.webp');
			res.send({ message: 'Avatar deleted successfully' });
		}
		catch (error)
		{
			res.status(401).send({ message: 'Error caused when deleting avatar' });
		}
	});
}

export default profileApi;
