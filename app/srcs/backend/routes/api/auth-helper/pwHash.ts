import * as bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string>
{
	return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashed_pw: string): Promise<boolean>
{
	return bcrypt.compare(password, hashed_pw);
}
