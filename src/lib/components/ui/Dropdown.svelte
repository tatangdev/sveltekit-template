<script lang="ts">
	import type { Snippet } from 'svelte';
	import { clickOutside } from '$lib/actions/clickOutside';
	import { dropdownPosition } from '$lib/actions/dropdownPosition';

	type Props = {
		open: boolean;
		trigger: HTMLElement | null;
		children: Snippet;
		class?: string;
	};

	let { open = $bindable(), trigger, children, class: panelClass = '' }: Props = $props();
</script>

{#if open && trigger}
	<div
		use:dropdownPosition={{ trigger, open }}
		use:clickOutside={() => (open = false)}
		class={panelClass}
	>
		{@render children()}
	</div>
{/if}
