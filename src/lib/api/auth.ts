import { z } from 'zod';
import { api } from './client';

const TokenPairSchema = z.object({
	user_id: z.string(),
	access_token: z.string(),
	refresh_token: z.string(),
	expires_at: z.number()
});

const RegisterResultSchema = z.object({
	user_id: z.string(),
	email: z.string(),
	otp_sent: z.boolean(),
	otp_expires_at: z.number()
});

const ResendOtpResultSchema = z.object({
	otp_sent: z.boolean(),
	expires_at: z.number(),
	retry_after_seconds: z.number()
});

const RefreshResultSchema = z.object({
	access_token: z.string(),
	refresh_token: z.string(),
	expires_at: z.number()
});

const Envelope = <T extends z.ZodTypeAny>(data: T) => z.object({ data });

export type TokenPair = z.infer<typeof TokenPairSchema>;
export type RegisterResult = z.infer<typeof RegisterResultSchema>;
export type ResendOtpResult = z.infer<typeof ResendOtpResultSchema>;
export type RefreshResult = z.infer<typeof RefreshResultSchema>;

const unwrap = <T>(promise: Promise<{ data: T }>): Promise<T> => promise.then((r) => r.data);

export const authApi = {
	register(email: string, password: string): Promise<RegisterResult> {
		return unwrap(
			api.post('/api/app/auth/register', Envelope(RegisterResultSchema), { email, password })
		);
	},
	verifyEmail(email: string, otpCode: string): Promise<TokenPair> {
		return unwrap(
			api.post('/api/app/auth/verify', Envelope(TokenPairSchema), { email, otp_code: otpCode })
		);
	},
	resendOtp(email: string): Promise<ResendOtpResult> {
		return unwrap(api.post('/api/app/auth/resend-otp', Envelope(ResendOtpResultSchema), { email }));
	},
	login(email: string, password: string): Promise<TokenPair> {
		return unwrap(api.post('/api/app/auth/login', Envelope(TokenPairSchema), { email, password }));
	},
	googleLogin(code: string): Promise<TokenPair> {
		return unwrap(api.post('/api/app/auth/google', Envelope(TokenPairSchema), { code }));
	},
	refresh(refreshToken: string): Promise<RefreshResult> {
		return unwrap(
			api.post('/api/app/auth/refresh', Envelope(RefreshResultSchema), {
				refresh_token: refreshToken
			})
		);
	},
	logout(token: string): Promise<void> {
		return api.postVoid('/api/app/auth/logout', undefined, { token });
	}
};
