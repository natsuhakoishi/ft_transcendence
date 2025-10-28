import { hashPassword } from "../routes/api/auth-helper/pwHash.ts";
import { D_PASS, Q_MAIL, Y_MAIL, Z_MAIL } from "../server.ts";
import { createProfile } from "./profile.ts";
import { createUser, getUserByEmail } from "./user.ts";

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
}
