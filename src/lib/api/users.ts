import { z } from 'zod';
import { api } from './client';

export const UserSchema = z.object({
	id: z.string(),
	email: z.string(),
	email_verified_at: z.number().nullable(),
	first_name: z.string().nullable(),
	last_name: z.string().nullable(),
	date_of_birth: z.string().nullable(),
	avatar_url: z.string().nullable(),
	currency: z.string().nullable(),
	marketing_emails: z.boolean(),
	created_at: z.number()
});

export type User = z.infer<typeof UserSchema>;

export type UpdateUserRequest = {
	first_name?: string;
	last_name?: string;
	date_of_birth?: string;
	currency?: string;
	marketing_emails?: boolean;
};

const Envelope = z.object({ data: UserSchema });
const unwrap = (p: Promise<{ data: User }>): Promise<User> => p.then((r) => r.data);

export const usersApi = {
	me(token: string): Promise<User> {
		return unwrap(api.get('/api/app/users/me', Envelope, { token }));
	},
	update(token: string, body: UpdateUserRequest): Promise<User> {
		return unwrap(api.patch('/api/app/users/me', Envelope, body, { token }));
	}
};
