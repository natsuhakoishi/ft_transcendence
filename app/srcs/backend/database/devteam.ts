import { hashPassword } from "../routes/api/auth-helper/pwHash.ts";
import { D_PASS, Q_MAIL, Y_MAIL, Z_MAIL } from "../server.ts";
import { createProfile, setAvatarPath } from "./profile.ts";
import { createUser, getUserByEmail } from "./user.ts";

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

export async function createDevTeamUser()
{
	if (await getUserByEmail(Q_MAIL) || await getUserByEmail(Y_MAIL) || await getUserByEmail(Z_MAIL))
		return ;

	const qiqi = { name: "QiqiNatsu", email: Q_MAIL, password: D_PASS };
	const yabi = { name: "Yabi", email: Y_MAIL, password: D_PASS };
	const zhen = { name: "Night", email: Z_MAIL, password: D_PASS };

	await createUser(qiqi.name, qiqi.email, await hashPassword(qiqi.password));
	await createProfile(qiqi.name);
	await createUser(yabi.name, yabi.email, await hashPassword(yabi.password));
	await createProfile(yabi.name);
	await createUser(zhen.name, zhen.email, await hashPassword(zhen.password));
	await createProfile(zhen.name);

	const dir_name = path.dirname(fileURLToPath(import.meta.url));
	const dir = path.join(dir_name, '..', 'assets', 'avatars');

	const qiqiAvatar = path.join(dir, 'qiqi_dev.webp');
	const yabiAvatar = path.join(dir, 'yabi_dev.webp');
	const zhenAvatar = path.join(dir, 'zhen_dev.webp');

	const qiqiBuffer = await fs.promises.readFile(qiqiAvatar);
	const yabiBuffer = await fs.promises.readFile(yabiAvatar);
	const zhenBuffer = await fs.promises.readFile(zhenAvatar);

	await setAvatarPath(1, 'qiqi_dev.webp', qiqiBuffer);
	await setAvatarPath(2, 'yabi_dev.webp', yabiBuffer);
	await setAvatarPath(3, 'zhen_dev.webp', zhenBuffer);
}
