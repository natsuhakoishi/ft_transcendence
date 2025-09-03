import nodemailer from 'nodemailer';
import { SMTP_EMAIL, SMTP_APP_SECRET } from "../../../server.ts";
import { otpTemp } from '../auth-api.ts';

export async function sendOTP(email: string): Promise<boolean>
{
	const otp = (Math.floor(Math.random() * 1000000)).toString().padStart(6, '0');
	otpTemp[email] = { otp, expires: Date.now() + 5 * 60 * 1000, attempts: 0 };

	try
	{
		const transporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			port: 587,
			secure: false,
			auth: {
				user: SMTP_EMAIL,
				pass: SMTP_APP_SECRET,
			},
		});

		await transporter.sendMail({
			from: SMTP_EMAIL,
			to: email,
			subject: 'Your OTP Code for ft_klbq',
			text: `Your 2FA Verification Code is: ${otp}. Valid for 5 minutes.`,
			html: `<p>Your 2FA verification code is: <b>${otp}</b></p>`,
		});
		return (true);
	}
	catch (error)
	{
		console.error(error);
		return (false);
	}
}
