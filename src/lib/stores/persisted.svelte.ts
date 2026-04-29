import { browser } from '$app/environment';

export function persisted<T>(key: string, initial: T) {
	let value = $state(initial);

	if (browser) {
		const raw = localStorage.getItem(key);
		if (raw !== null) {
			try {
				value = JSON.parse(raw) as T;
			} catch {
				// ignore invalid JSON
			}
		}
	}

	return {
		get value() {
			return value;
		},
		set value(next: T) {
			value = next;
			if (browser) {
				localStorage.setItem(key, JSON.stringify(next));
			}
		}
	};
}
