import type { Action } from 'svelte/action';

/**
 * Port of the Alpine `dropdown` component's `position()` helper:
 * fixes the dropdown panel to the viewport under the trigger and flips
 * above when it would overflow the bottom edge.
 */
export const dropdownPosition: Action<HTMLElement, { trigger: HTMLElement; open: boolean }> = (
	node,
	params
) => {
	let current = params;

	function place() {
		if (!current.open) return;
		const rect = current.trigger.getBoundingClientRect();
		node.style.position = 'fixed';
		node.style.top = `${rect.bottom}px`;
		node.style.right = `${window.innerWidth - rect.right}px`;
		node.style.zIndex = '999';

		const panel = node.getBoundingClientRect();
		if (panel.bottom > window.innerHeight) {
			node.style.top = `${rect.top - panel.height}px`;
		}
	}

	place();
	window.addEventListener('resize', place);
	window.addEventListener('scroll', place, true);

	return {
		update(next) {
			current = next;
			place();
		},
		destroy() {
			window.removeEventListener('resize', place);
			window.removeEventListener('scroll', place, true);
		}
	};
};
