import { createUserByGoogle, getUserByEmail } from '../../database/user.ts';
import { createProfile, setLoginStatus } from '../../database/profile.ts';
import { type FastifyPluginAsync } from 'fastify';
import { OAuth2Client } from 'google-auth-library';

const authGoogleApi: FastifyPluginAsync = async (fastify: any) => {
	const oauth2Client = new OAuth2Client({
	clientId: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	redirectUri: 'postmessage',
	});

	fastify.post('/auth/google', async (req: any, res: any) => {
	try {
		const { credential } = req.body as { credential: string };
		if (!credential)
			return res.status(400).send({ error: 'Missing credential' });

		const ticket = await oauth2Client.verifyIdToken({
			idToken: credential,
			audience: process.env.GOOGLE_CLIENT_ID,
		});

		const payload = ticket.getPayload();
		if (!payload?.email) {
			return res.status(400).send({ error: 'Google response missing email field' });
		}

		const email = payload.email;
		let user = await getUserByEmail(email);
		if (!user)
		{
			const username = payload.name || `user_${Date.now()}`;
			await createUserByGoogle(username, email, '');
			await createProfile(username);
			user = await getUserByEmail(email);
		}

		//login
		if (user.google_login_flag === 0)
			return res.status(400).send({ message: 'This gmail already exist in our Database, please login with your password '});
		await setLoginStatus(user.id, true);

		const jwtToken = fastify.jwt.sign({ id: user.id }, { expiresIn: '2h' });
		res.setCookie('cookiesToken', jwtToken, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 2 * 60 * 60,
		});

		return res.send({ message: 'Google login success' });

    } catch (err) {
		fastify.log.error(err);
		return res.status(500).send({ error: 'Server Error: Google Auth' });
    }
  });
}

export default authGoogleApi;

	// fastify.get('/auth/google/callback', async (req: any, res: any) => {
	// 	try
	// 	{
	// 		const token = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
	// 		const userData = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
	// 			headers: {
	// 				Authorization: `Bearer ${token.token.access_token}`
	// 			}
	// 		}).then(r => r.json());

	// 		let user = await getUserByEmail(userData.email);
	// 		// register if account not exist
	// 		if (!user)
	// 		{
	// 			const username = userData.name || `user_${Date.now()}`;
	// 			await createUserByGoogle(username, userData.email, '');
	// 			await createProfile(username);
	// 			user = await getUserByEmail(userData.email);
	// 		}

	// 		//login
	// 		if (user.google_login_flag === 0)
	// 			return res.status(400).send({ message: 'This gmail already exist in our Database, please login with your password '});
	// 		await setLoginStatus(user.id, true);
	// 		const jwtToken = fastify.jwt.sign({ id: user.id }, { expiresIn: '2h' });
	// 		res.setCookie("cookiesToken", jwtToken, {
	// 			path: "/",
	// 			httpOnly: true,
	// 			secure: true,
	// 			sameSite: "lax",
	// 			maxAge: 2 * 60 * 60
	// 		}).redirect("https://localhost:5173/");
	// 	}
	// 	catch (error: any)
	// 	{
	// 		fastify.log.error(error);
	// 		return res.status(500).send({ message: 'Google OAuth callback failed', error: error.message });
	// 	}
	// });