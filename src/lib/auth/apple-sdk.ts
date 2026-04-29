import { PUBLIC_APPLE_REDIRECT_URI, PUBLIC_APPLE_SERVICE_ID } from '$env/static/public';

interface AppleAuthSdk {
	init: (config: {
		clientId: string;
		scope: string;
		redirectURI: string;
		usePopup: boolean;
	}) => void;
	signIn: () => void;
}

declare global {
	interface Window {
		AppleID?: { auth: AppleAuthSdk };
	}
}

interface AppleAuthSuccessDetail {
	authorization: { id_token: string; code?: string; state?: string };
	user?: { name?: { firstName?: string; lastName?: string }; email?: string };
}

interface AppleAuthFailureDetail {
	error: string;
}

const SDK_SRC =
	'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
const SCRIPT_ID = 'apple-id-auth-sdk';
const LOAD_TIMEOUT_MS = 10_000;

export const appleServiceId = PUBLIC_APPLE_SERVICE_ID;

export class AppleSignInCancelled extends Error {
	constructor() {
		super('Apple sign-in was cancelled.');
		this.name = 'AppleSignInCancelled';
	}
}

export interface AppleAuthResult {
	idToken: string;
	userName?: string;
}

export function isAppleConfigured(): boolean {
	return !!appleServiceId;
}

let sdkPromise: Promise<AppleAuthSdk> | null = null;

function loadSdk(): Promise<AppleAuthSdk> {
	if (typeof window === 'undefined') {
		return Promise.reject(new Error('Apple SDK can only load in the browser.'));
	}
	if (window.AppleID?.auth) return Promise.resolve(window.AppleID.auth);
	if (sdkPromise) return sdkPromise;

	sdkPromise = new Promise<AppleAuthSdk>((resolve, reject) => {
		let settled = false;
		const timeoutId = window.setTimeout(() => {
			if (settled) return;
			settled = true;
			sdkPromise = null;
			reject(new Error('Apple SDK load timed out.'));
		}, LOAD_TIMEOUT_MS);

		const onReady = () => {
			if (settled) return;
			settled = true;
			clearTimeout(timeoutId);
			if (window.AppleID?.auth) resolve(window.AppleID.auth);
			else {
				sdkPromise = null;
				reject(new Error('Apple SDK loaded but window.AppleID is missing.'));
			}
		};

		const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
		if (existing) {
			existing.addEventListener('load', onReady, { once: true });
			existing.addEventListener(
				'error',
				() => {
					if (settled) return;
					settled = true;
					clearTimeout(timeoutId);
					sdkPromise = null;
					reject(new Error('Failed to load Apple SDK.'));
				},
				{ once: true }
			);
			return;
		}

		const script = document.createElement('script');
		script.id = SCRIPT_ID;
		script.src = SDK_SRC;
		script.async = true;
		script.defer = true;
		script.onload = onReady;
		script.onerror = () => {
			if (settled) return;
			settled = true;
			clearTimeout(timeoutId);
			script.remove();
			sdkPromise = null;
			reject(new Error('Failed to load Apple SDK.'));
		};
		document.head.appendChild(script);
	});

	return sdkPromise;
}

function defaultRedirectUri(): string {
	return new URL('/auth/apple/callback', window.location.origin).toString();
}

export async function requestAppleAuth(): Promise<AppleAuthResult> {
	if (!appleServiceId) {
		throw new Error('Apple Service ID is not configured (PUBLIC_APPLE_SERVICE_ID).');
	}
	const sdk = await loadSdk();
	const redirectURI = PUBLIC_APPLE_REDIRECT_URI || defaultRedirectUri();

	sdk.init({ clientId: appleServiceId, scope: 'name email', redirectURI, usePopup: true });

	return new Promise<AppleAuthResult>((resolve, reject) => {
		const onSuccess = (event: Event) => {
			document.removeEventListener('AppleIDSignInOnFailure', onFailure);
			const detail = (event as CustomEvent<AppleAuthSuccessDetail>).detail;
			const idToken = detail.authorization.id_token;
			if (!idToken) {
				reject(new Error('Apple did not return an id_token.'));
				return;
			}
			let userName: string | undefined;
			if (detail.user?.name) {
				const parts = [detail.user.name.firstName, detail.user.name.lastName].filter(Boolean);
				if (parts.length > 0) userName = parts.join(' ');
			}
			resolve({ idToken, ...(userName ? { userName } : {}) });
		};

		const onFailure = (event: Event) => {
			document.removeEventListener('AppleIDSignInOnSuccess', onSuccess);
			const detail = (event as CustomEvent<AppleAuthFailureDetail>).detail;
			if (detail.error === 'popup_closed_by_user') {
				reject(new AppleSignInCancelled());
				return;
			}
			reject(new Error(detail.error || 'Apple sign-in failed.'));
		};

		document.addEventListener('AppleIDSignInOnSuccess', onSuccess, { once: true });
		document.addEventListener('AppleIDSignInOnFailure', onFailure, { once: true });

		sdk.signIn();
	});
}
