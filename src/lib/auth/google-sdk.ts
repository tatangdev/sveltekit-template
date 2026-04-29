import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';

interface GoogleCodeResponse {
	code: string;
	error?: string;
	error_description?: string;
}

interface GoogleCodeError {
	type: string;
	message?: string;
}

interface GoogleCodeClient {
	requestCode: () => void;
}

interface GoogleAccountsOauth2 {
	initCodeClient: (config: {
		client_id: string;
		scope: string;
		ux_mode: 'popup' | 'redirect';
		callback: (response: GoogleCodeResponse) => void;
		error_callback?: (error: GoogleCodeError) => void;
	}) => GoogleCodeClient;
}

declare global {
	interface Window {
		google?: { accounts: { oauth2: GoogleAccountsOauth2 } };
	}
}

const SDK_SRC = 'https://accounts.google.com/gsi/client';
const SCRIPT_ID = 'google-gsi-sdk';
const LOAD_TIMEOUT_MS = 10_000;

export class GoogleSignInCancelled extends Error {
	constructor() {
		super('Google sign-in was cancelled.');
		this.name = 'GoogleSignInCancelled';
	}
}

export const googleClientId = PUBLIC_GOOGLE_CLIENT_ID;

let sdkPromise: Promise<GoogleAccountsOauth2> | null = null;

function loadSdk(): Promise<GoogleAccountsOauth2> {
	if (typeof window === 'undefined') {
		return Promise.reject(new Error('Google SDK can only load in the browser.'));
	}
	if (window.google?.accounts.oauth2) {
		return Promise.resolve(window.google.accounts.oauth2);
	}
	if (sdkPromise) return sdkPromise;

	sdkPromise = new Promise<GoogleAccountsOauth2>((resolve, reject) => {
		const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
		const onReady = () => {
			if (window.google?.accounts.oauth2) resolve(window.google.accounts.oauth2);
			else reject(new Error('Google SDK loaded but window.google is missing.'));
		};

		if (existing) {
			existing.addEventListener('load', onReady, { once: true });
			existing.addEventListener('error', () => reject(new Error('Failed to load Google SDK.')), {
				once: true
			});
			return;
		}

		const script = document.createElement('script');
		script.id = SCRIPT_ID;
		script.src = SDK_SRC;
		script.async = true;
		script.defer = true;
		script.onload = onReady;
		script.onerror = () => {
			script.remove();
			sdkPromise = null;
			reject(new Error('Failed to load Google SDK.'));
		};
		document.head.appendChild(script);

		setTimeout(() => {
			if (!window.google) {
				sdkPromise = null;
				reject(new Error('Google SDK load timed out.'));
			}
		}, LOAD_TIMEOUT_MS);
	});

	return sdkPromise;
}

export function isGoogleConfigured(): boolean {
	return !!googleClientId;
}

export async function requestGoogleAuthCode(): Promise<string> {
	if (!googleClientId) {
		throw new Error('Google client ID is not configured (PUBLIC_GOOGLE_CLIENT_ID).');
	}
	const oauth2 = await loadSdk();

	return new Promise<string>((resolve, reject) => {
		const client = oauth2.initCodeClient({
			client_id: googleClientId,
			scope: 'openid email profile',
			ux_mode: 'popup',
			callback: (response) => {
				if (response.error) {
					reject(new Error(response.error_description ?? 'Google sign-in failed.'));
					return;
				}
				resolve(response.code);
			},
			error_callback: (error) => {
				if (error.type === 'popup_closed') {
					reject(new GoogleSignInCancelled());
					return;
				}
				reject(new Error(error.message ?? 'Google sign-in failed.'));
			}
		});
		client.requestCode();
	});
}
