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
			host: "smtp.gmail.com",
			port: 587,
			secure: false,
			auth: {
				user: SMTP_EMAIL,
				pass: SMTP_APP_SECRET,
			},
		});

		await transporter.sendMail({
			from: `"no-reply.transcendence@gmail.com" <${SMTP_EMAIL}>`,
			to: email,
			subject: `${otp} is your ft_klbq verification code`,
			text: `Your 2FA Verification Code for ft_klbq is: ${otp}. Valid for 5 minutes.`,
			html: `
				<p><b>Hi!</b></p>
				<p>You are completing identity verification. Your verification code is: <b>${otp}</b></p>
				<p>Please complete the account verification process in 5 minutes.</p>
				<p>Team ft_klbq</p>
				<p><i>This is an automated email. Please do not reply to this email.</i></p>`,
		});
		return (true);
	}
	catch (error)
	{
		console.error(error);
		return (false);
	}
}
