import type { Action } from 'svelte/action';

export const clickOutside: Action<HTMLElement, () => void> = (node, callback) => {
	let handler = callback;

	const onClick = (event: MouseEvent) => {
		const target = event.target as Element | null;
		if (!target) return;
		if (node.contains(target)) return;
		if (target.closest('[data-clickoutside-ignore]')) return;
		handler?.();
	};

	document.addEventListener('click', onClick, true);

	return {
		update(next) {
			handler = next;
		},
		destroy() {
			document.removeEventListener('click', onClick, true);
		}
	};
};
