import nodemailer from 'nodemailer';
import crypto from 'crypto';
import validator from 'validator';
import dns from 'dns/promises';

import { SMTP_EMAIL, SMTP_APP_SECRET } from "../../../server.ts";
import { otpTemp } from '../auth-api.ts';

export async function sendOTP(email: string): Promise<boolean>
{
	if (!validator.isEmail(email))
	{
		console.error("Error: Invalid email format: ", email);
		return (false);
	}

	try
	{
		const domain = email.split("@")[1];
		const mx = await dns.resolveMx(domain);
		if (!mx || mx.length === 0)
		{
			console.error("Error: No MX records for domain: ", domain);
			return (false);
		}
	}
	catch (error)
	{
		console.error("Error: MX resolve failed: ", email, error);
		return (false);
	}

	const otp = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
	otpTemp[email] = { otp, expires: Date.now() + 5 * 60 * 1000, attempts: 0 };

	try
	{
		const transporter = nodemailer.createTransport({
			host: `"ft_klbq 2FA Verification" <${SMTP_EMAIL}>`,
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
