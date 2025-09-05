import type { FastifyPluginAsync } from 'fastify';
import { createUserByGoogle, getUserByEmail } from '../../database/user.ts';
import { createProfile, setLoginStatus } from '../../database/profile.ts';

const authGoogleApi: FastifyPluginAsync = async (fastify: any) => {
	fastify.get('/auth/google/callback', async (req: any, res: any) => {
		const token = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
		const userData = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
			headers: {
				Authorization: `Bearer ${token.token.access_token}`
			}
		}).then(r => r.json());

		let user = await getUserByEmail(userData.email);
		// register if account not exist
		if (!user)
		{
			const username = userData.name || `user_${Date.now()}`;
			await createUserByGoogle(username, userData.email, '');
			await createProfile(username);
			user = await getUserByEmail(userData.email);
		}

		//login
		if (user.google_login_flag === 0)
			return res.status(400).send({ message: 'This gmail already exist in our Database, please login with your password '});
		await setLoginStatus(user.id, true);
		const jwtToken = fastify.jwt.sign({ id: user.id }, { expiresIn: '2h' });
		res.send({ token: jwtToken, email: userData.email, name: userData.name });
	});
}

export default authGoogleApi;
