import type { FastifyPluginAsync } from 'fastify';
import { loginSchema, registerSchema } from './auth-helper/schema.ts';
import { createUser, getUserByEmail, getUserByUsername } from '../../database/user.ts';
import { verifyPassword, hashPassword } from './auth-helper/pwHash.ts';
import { createProfile, setLoginStatus } from '../../database/profile.ts';

const authApi: FastifyPluginAsync = async (fastify: any) => {
	// register
	fastify.post('/register', { schema: registerSchema }, async (req: any, res: any) => {
		const { username, email, password } = req.body as any;
		if (await getUserByUsername(username))
			return res.status(400).send({ message: 'Warning: Username already taken.' });
		if (await getUserByEmail(email))
			return res.status(400).send({ message: 'Warning: Email already registered.' });

		const hashed_pw = await hashPassword(password);

		await createUser(username, email, hashed_pw);
		await createProfile(username);
		res.send({ message: `User ${username} created successfully!` });
	});

	// login
	fastify.post('/login', { schema: loginSchema }, async (req: any, res: any) => {
		const { email, password } = req.body as any;
		const user = await getUserByEmail(email);
		if (!user || !(await verifyPassword(password, user.password)))
			return res.status(401).send({ message: 'Invalid email or password' });
		await setLoginStatus(user.id, true);

		const token = fastify.jwt.sign({ id: user.id }, { expiresIn: '2h' });
		res.send({ token });
	});

	// logout
	fastify.post('/logout', async (req: any, res: any) => {
		const user = await req.jwtVerify();
		await setLoginStatus(user.id, false);
		res.send({ message: 'Logged out successfully.' });
	});
};

export default authApi;
