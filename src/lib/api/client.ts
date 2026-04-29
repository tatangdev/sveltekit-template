import { PUBLIC_API_URL } from '$env/static/public';
import type { z } from 'zod';

export class ApiError extends Error {
	constructor(
		message: string,
		public status: number
	) {
		super(message);
		this.name = 'ApiError';
	}
}

interface ErrorBody {
	errors?: string;
	message?: string;
}

export interface RequestOptions {
	token?: string | null;
	signal?: AbortSignal;
}

const baseHeaders = (token?: string | null): Record<string, string> => ({
	'Content-Type': 'application/json',
	...(token ? { Authorization: `Bearer ${token}` } : {})
});

async function send(
	endpoint: string,
	method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
	body?: unknown,
	options?: RequestOptions
): Promise<Response> {
	const url = `${PUBLIC_API_URL}${endpoint}`;
	let response: Response;
	try {
		response = await fetch(url, {
			method,
			headers: baseHeaders(options?.token),
			...(body !== undefined && { body: JSON.stringify(body) }),
			...(options?.signal && { signal: options.signal })
		});
	} catch {
		throw new ApiError('Network error — could not reach the server.', 0);
	}

	if (!response.ok) {
		let payload: ErrorBody = {};
		try {
			payload = (await response.json()) as ErrorBody;
		} catch {
			// ignore
		}
		if (response.status === 401 && options?.token && typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('auth:session-revoked'));
		}
		throw new ApiError(
			payload.errors ?? payload.message ?? `Request failed with status ${String(response.status)}`,
			response.status
		);
	}

	return response;
}

async function parseJson<T>(response: Response, schema: z.ZodType<T>): Promise<T> {
	const data: unknown = await response.json();
	const result = schema.safeParse(data);
	if (!result.success) throw new ApiError('Invalid API response format', 500);
	return result.data;
}

export const api = {
	async get<T>(endpoint: string, schema: z.ZodType<T>, options?: RequestOptions): Promise<T> {
		return parseJson(await send(endpoint, 'GET', undefined, options), schema);
	},
	async post<T>(
		endpoint: string,
		schema: z.ZodType<T>,
		body: unknown,
		options?: RequestOptions
	): Promise<T> {
		return parseJson(await send(endpoint, 'POST', body, options), schema);
	},
	async patch<T>(
		endpoint: string,
		schema: z.ZodType<T>,
		body: unknown,
		options?: RequestOptions
	): Promise<T> {
		return parseJson(await send(endpoint, 'PATCH', body, options), schema);
	},
	async postVoid(endpoint: string, body?: unknown, options?: RequestOptions): Promise<void> {
		await send(endpoint, 'POST', body, options);
	}
};
