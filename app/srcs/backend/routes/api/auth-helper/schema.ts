export const registerSchema = {
	body: {
		type: 'object',
		required: ['username', 'email', 'password'],
		properties: {
			username: { type: 'string', minLength: 3, maxLength: 20 },
			email: { type: 'string', format: 'email' },
			password: { type: 'string', minLength: 8 }
		}
	}
};

export const loginSchema = {
	body: {
		type: 'object',
		required: ['email', 'password'],
		properties: {
			email: { type: 'string' },
			password: { type: 'string' }
		}
	}
};
