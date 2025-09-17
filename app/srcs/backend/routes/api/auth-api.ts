import type { FastifyPluginAsync } from 'fastify';
import { loginSchema, registerSchema } from './auth-helper/schema.ts';
import { createUser, getUserByEmail, getUserByUsername } from '../../database/user.ts';
import { verifyPassword, hashPassword } from './auth-helper/pwHash.ts';
import { createProfile, setLoginStatus } from '../../database/profile.ts';
import { sendOTP } from './auth-helper/sendOTP.ts';

export const otpTemp: Record<string, { otp: string; expires: number; attempts: number }> = {};
export const dataUserRegister: Record<string, { username: string; email: string; password: string }> = {};

const authApi: FastifyPluginAsync = async (fastify: any) => {
	// register
	fastify.post('/register', { schema: registerSchema }, async (req: any, res: any) => {
		const { username, email, password } = req.body as any;
		if (await getUserByUsername(username))
			return res.status(400).send({ message: 'Warning: Username already taken.' });
		if (await getUserByEmail(email))
			return res.status(400).send({ message: 'Warning: Email already registered.' });
		if (!password || password.length < 8)
		return res.status(400).send({ message: 'Warning: Password must be at least 8 characters long.' });

		const hashed_pw = await hashPassword(password);

		dataUserRegister[email] = { username, email, password: hashed_pw };

		const sent = await sendOTP(email);
		if (!sent)
			return res.status(500).send({ message: 'Error: Failed to send OTP, please enter valid email address' });
		res.send({ message: 'OTP sent successfully, please check email' });
	});

	// login
	fastify.post('/login', { schema: loginSchema }, async (req: any, res: any) => {
		const { email, password } = req.body as any;
		const user = await getUserByEmail(email);
		if (!user || !(await verifyPassword(password, user.password)))
			return res.status(401).send({ message: 'Invalid email or password' });
		if (user.google_login_flag === 1)
			return res.status(400).send({ message: 'This gmail already exist in our Database, please login with Google'} );

		const sent = await sendOTP(email);
		if (sent)
			res.send({ message: 'OTP sent successfully', requireOTP: true });
		else
			res.status(500).send({ message: 'Error: Failed to send OTP' });
	});

	fastify.post('/otp_verify_register', async (req: any, res: any) => {
		const { email, otp } = req.body as { email: string, otp: string };
		if (!email || !otp)
			return res.status(400).send({ message: 'Error: Email and OTP are required.' });

		const temp = otpTemp[email];
		if (!temp)
			return res.status(400).send({ message: 'Error: No OTP requested for this email.' });

		if (temp.expires < Date.now())
		{
			delete otpTemp[email];
			delete dataUserRegister[email];
			return res.status(400).send({ message: 'Error: OTP expired, need to make a new request for OTP' });
		}

		if (temp.attempts >= 5)
			return res.status(429).send({ message: 'Too many attempts. Try again later.' });

		if (temp.otp !== otp)
		{
			temp.attempts += 1;
			return res.status(400).send({ message: 'Invalid OTP.' });
		}

		const userData = dataUserRegister[email];
		if (!userData)
			return res.status(400).send({ message: 'Error: No user data for this email' });

		await createUser(userData.username, userData.email, userData.password);
		await createProfile(userData.username);

		delete otpTemp[email];
		delete dataUserRegister[email];

		const user = await getUserByEmail(email);
		await setLoginStatus(user.id, true);
		const token = fastify.jwt.sign({ id: user.id }, { expiresIn: '2h' });

		res.setCookie("cookiesToken", token, {
			path: "/",
			httpOnly: true,
			secure: true,
			sameSite: "strict",
			maxAge: 2 * 60 * 60
		}).send({ email, name: user.username });
	});

	//verify-otp-login
	fastify.post('/otp_verify_login', async (req: any, res: any) => {
		const { email, otp } = req.body as { email: string, otp: string };
		if (!email || !otp)
			return res.status(400).send({ message: 'Error: Email and OTP are required.' });

		const temp = otpTemp[email];
		if (!temp)
			return res.status(400).send({ message: 'Error: No OTP requested for this email.' });

		if (temp.expires < Date.now())
		{
			delete otpTemp[email];
			return res.status(400).send({ message: 'Error: OTP expired, need to make a new request for OTP' });
		}

		if (temp.attempts >= 5)
			return res.status(429).send({ message: 'Too many attempts. Try again later.' });

		if (temp.otp !== otp)
		{
			temp.attempts += 1;
			return res.status(400).send({ message: 'Invalid OTP.' });
		}
		delete otpTemp[email];

		const user = await getUserByEmail(email);
		await setLoginStatus(user.id, true);
		const token = fastify.jwt.sign({ id: user.id }, { expiresIn: '2h' });
		res.setCookie("cookiesToken", token, {
			path: "/",
			httpOnly: true,
			secure: true,
			sameSite: "strict",
			maxAge: 2 * 60 * 60
		}).send({ email, name: user.username });
	});

	// logout
	fastify.post('/logout', async (req: any, res: any) => {
		const user = await req.jwtVerify();
		await setLoginStatus(user.id, false);
		res.send({ message: 'Logged out successfully.' });
	});
};

export default authApi;
