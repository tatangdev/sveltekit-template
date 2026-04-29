import { PUBLIC_FACEBOOK_API_VERSION, PUBLIC_FACEBOOK_APP_ID } from '$env/static/public';

interface FacebookAuthResponse {
	accessToken: string;
	expiresIn: number;
	signedRequest: string;
	userID: string;
}

interface FacebookLoginResponse {
	status: 'connected' | 'not_authorized' | 'unknown';
	authResponse?: FacebookAuthResponse;
}

interface FacebookSdk {
	init: (params: { appId: string; cookie?: boolean; xfbml?: boolean; version: string }) => void;
	login: (
		callback: (response: FacebookLoginResponse) => void,
		options?: { scope?: string }
	) => void;
}

declare global {
	interface Window {
		fbAsyncInit?: () => void;
		FB?: FacebookSdk;
	}
}

const SDK_SRC = 'https://connect.facebook.net/en_US/sdk.js';
const SCRIPT_ID = 'facebook-jssdk';
const LOAD_TIMEOUT_MS = 10_000;

export const facebookAppId = PUBLIC_FACEBOOK_APP_ID;
const apiVersion = (PUBLIC_FACEBOOK_API_VERSION || 'v21.0').replace(/^v?/, 'v');

export class FacebookSignInCancelled extends Error {
	constructor() {
		super('Facebook sign-in was cancelled.');
		this.name = 'FacebookSignInCancelled';
	}
}

export function isFacebookConfigured(): boolean {
	return !!facebookAppId;
}

let sdkPromise: Promise<FacebookSdk> | null = null;

function loadSdk(): Promise<FacebookSdk> {
	if (typeof window === 'undefined') {
		return Promise.reject(new Error('Facebook SDK can only load in the browser.'));
	}
	if (window.FB) return Promise.resolve(window.FB);
	if (sdkPromise) return sdkPromise;

	sdkPromise = new Promise<FacebookSdk>((resolve, reject) => {
		let settled = false;
		const timeoutId = window.setTimeout(() => {
			if (settled) return;
			settled = true;
			sdkPromise = null;
			reject(new Error('Facebook SDK load timed out.'));
		}, LOAD_TIMEOUT_MS);

		const initOnce = () => {
			if (settled) return;
			if (!window.FB) {
				settled = true;
				clearTimeout(timeoutId);
				sdkPromise = null;
				reject(new Error('Facebook SDK loaded but window.FB is missing.'));
				return;
			}
			window.FB.init({ appId: facebookAppId, cookie: true, xfbml: false, version: apiVersion });
			settled = true;
			clearTimeout(timeoutId);
			resolve(window.FB);
		};

		window.fbAsyncInit = initOnce;

		if (window.FB) {
			initOnce();
			return;
		}

		if (document.getElementById(SCRIPT_ID)) return;

		const script = document.createElement('script');
		script.id = SCRIPT_ID;
		script.src = SDK_SRC;
		script.async = true;
		script.defer = true;
		script.onerror = () => {
			if (settled) return;
			settled = true;
			clearTimeout(timeoutId);
			script.remove();
			sdkPromise = null;
			reject(new Error('Failed to load Facebook SDK.'));
		};
		document.head.appendChild(script);
	});

	return sdkPromise;
}

export async function requestFacebookAccessToken(): Promise<string> {
	if (!facebookAppId) {
		throw new Error('Facebook App ID is not configured (PUBLIC_FACEBOOK_APP_ID).');
	}
	const fb = await loadSdk();
	return new Promise<string>((resolve, reject) => {
		fb.login(
			(response) => {
				if (response.status === 'connected' && response.authResponse?.accessToken) {
					resolve(response.authResponse.accessToken);
					return;
				}
				if (response.status === 'not_authorized' || response.status === 'unknown') {
					reject(new FacebookSignInCancelled());
					return;
				}
				reject(new Error('Facebook sign-in failed.'));
			},
			{ scope: 'public_profile,email' }
		);
	});
}
