import { browser } from '$app/environment';
import { persisted } from './persisted.svelte';

const stored = persisted<boolean>('darkMode', false);

function syncDom() {
	if (!browser) return;
	document.documentElement.classList.toggle('dark', stored.value);
}

if (browser) syncDom();

export const theme = {
	get dark() {
		return stored.value;
	},
	set dark(next: boolean) {
		stored.value = next;
		syncDom();
	},
	toggle() {
		stored.value = !stored.value;
		syncDom();
	}
};
