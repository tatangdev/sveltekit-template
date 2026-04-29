import { browser } from '$app/environment';
import { persisted } from './persisted.svelte';

const stored = persisted<boolean>('darkMode', false);

function applyDarkClass() {
	if (!browser) return;
	document.documentElement.classList.toggle('dark', stored.value);
}

// Suppress hover transitions during the toggle so the whole page flips at once.
function applyDarkClassWithoutTransitions() {
	if (!browser) return;
	document.documentElement.classList.add('no-transitions');
	applyDarkClass();
	void document.documentElement.offsetHeight; // force reflow
	requestAnimationFrame(() => {
		document.documentElement.classList.remove('no-transitions');
	});
}

if (browser) applyDarkClass();

export const theme = {
	get dark() {
		return stored.value;
	},
	set dark(next: boolean) {
		stored.value = next;
		applyDarkClassWithoutTransitions();
	},
	toggle() {
		stored.value = !stored.value;
		applyDarkClassWithoutTransitions();
	}
};
