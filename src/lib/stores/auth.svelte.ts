import { browser } from '$app/environment';
import { authApi } from '$lib/api/auth';
import { ApiError } from '$lib/api/client';
import { usersApi, type UpdateUserRequest, type User } from '$lib/api/users';

const STORAGE_KEY = 'app_auth';
const REFRESH_BUFFER_MS = 60 * 1000;

type View = 'signup' | 'login';

type Tokens = {
	userId: string;
	accessToken: string;
	refreshToken: string;
	expiresAt: number;
};

function loadTokens(): Tokens | null {
	if (!browser) return null;
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as Tokens;
	} catch {
		localStorage.removeItem(STORAGE_KEY);
		return null;
	}
}

function saveTokens(tokens: Tokens | null) {
	if (!browser) return;
	if (tokens) localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
	else localStorage.removeItem(STORAGE_KEY);
}

let tokens = $state<Tokens | null>(loadTokens());
let user = $state<User | null>(null);
let modalOpen = $state(false);
let modalView = $state<View>('signup');
let pendingEmail = $state<string | null>(null);
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let refreshing = false;

function clearRefreshTimer() {
	if (refreshTimer) {
		clearTimeout(refreshTimer);
		refreshTimer = null;
	}
}

function setTokens(next: Tokens | null) {
	tokens = next;
	saveTokens(next);
	clearRefreshTimer();
	if (next && browser) {
		const delay = Math.max(next.expiresAt - Date.now() - REFRESH_BUFFER_MS, 5_000);
		refreshTimer = setTimeout(() => {
			void refreshTokens();
		}, delay);
	}
}

async function refreshTokens(): Promise<boolean> {
	const current = tokens;
	if (!current || refreshing) return false;
	refreshing = true;
	try {
		const result = await authApi.refresh(current.refreshToken);
		setTokens({
			userId: current.userId,
			accessToken: result.access_token,
			refreshToken: result.refresh_token,
			expiresAt: result.expires_at
		});
		return true;
	} catch (err) {
		if (err instanceof ApiError && err.status === 401) {
			clearSession();
		}
		return false;
	} finally {
		refreshing = false;
	}
}

function clearSession() {
	setTokens(null);
	user = null;
	pendingEmail = null;
}

async function loadUser() {
	if (!tokens) return;
	try {
		user = await usersApi.me(tokens.accessToken);
	} catch (err) {
		if (err instanceof ApiError && err.status === 401) clearSession();
	}
}

if (browser) {
	const t = tokens;
	if (t) {
		if (t.expiresAt <= Date.now()) {
			void refreshTokens().then(() => {
				if (tokens) void loadUser();
			});
		} else {
			setTokens(t);
			void loadUser();
		}
	}

	window.addEventListener('auth:session-revoked', () => clearSession());
}

export const auth = {
	get user() {
		return user;
	},
	get isAuthenticated() {
		return !!tokens;
	},
	get accessToken() {
		return tokens?.accessToken ?? null;
	},
	get pendingEmail() {
		return pendingEmail;
	},
	get modalOpen() {
		return modalOpen;
	},
	get modalView() {
		return modalView;
	},
	openModal(view: View) {
		modalView = view;
		modalOpen = true;
	},
	closeModal() {
		modalOpen = false;
	},
	async register(email: string, password: string) {
		await authApi.register(email, password);
		pendingEmail = email;
	},
	async verifyEmail(email: string, otpCode: string) {
		const result = await authApi.verifyEmail(email, otpCode);
		setTokens({
			userId: result.user_id,
			accessToken: result.access_token,
			refreshToken: result.refresh_token,
			expiresAt: result.expires_at
		});
		pendingEmail = null;
		await loadUser();
	},
	async resendOtp(email: string) {
		await authApi.resendOtp(email);
	},
	async login(email: string, password: string) {
		const result = await authApi.login(email, password);
		setTokens({
			userId: result.user_id,
			accessToken: result.access_token,
			refreshToken: result.refresh_token,
			expiresAt: result.expires_at
		});
		await loadUser();
	},
	async googleLogin(code: string) {
		const result = await authApi.googleLogin(code);
		setTokens({
			userId: result.user_id,
			accessToken: result.access_token,
			refreshToken: result.refresh_token,
			expiresAt: result.expires_at
		});
		pendingEmail = null;
		await loadUser();
	},
	async facebookLogin(accessToken: string) {
		const result = await authApi.facebookLogin(accessToken);
		setTokens({
			userId: result.user_id,
			accessToken: result.access_token,
			refreshToken: result.refresh_token,
			expiresAt: result.expires_at
		});
		pendingEmail = null;
		await loadUser();
	},
	async appleLogin(idToken: string, userName?: string) {
		const result = await authApi.appleLogin(idToken, userName);
		setTokens({
			userId: result.user_id,
			accessToken: result.access_token,
			refreshToken: result.refresh_token,
			expiresAt: result.expires_at
		});
		pendingEmail = null;
		await loadUser();
	},
	async logout() {
		const token = tokens?.accessToken;
		if (token) {
			try {
				await authApi.logout(token);
			} catch {
				// ignore
			}
		}
		clearSession();
	},
	async updateMe(body: UpdateUserRequest) {
		if (!tokens) throw new Error('Not authenticated');
		user = await usersApi.update(tokens.accessToken, body);
		return user;
	}
};
