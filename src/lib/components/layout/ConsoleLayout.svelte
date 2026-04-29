<script lang="ts">
	import type { Snippet } from 'svelte';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import Header from './Header.svelte';
	import Overlay from './Overlay.svelte';
	import Sidebar from './Sidebar.svelte';

	let { children }: { children: Snippet } = $props();

	let scrollContainer: HTMLDivElement;
	const scrollPositions: Record<string, number> = {};

	beforeNavigate(({ from }) => {
		if (from && scrollContainer) {
			scrollPositions[from.url.pathname + from.url.search] = scrollContainer.scrollTop;
		}
	});

	afterNavigate(({ to, type }) => {
		if (!to || !scrollContainer) return;
		const key = to.url.pathname + to.url.search;
		if (type === 'popstate' && key in scrollPositions) {
			scrollContainer.scrollTop = scrollPositions[key];
		} else {
			scrollContainer.scrollTop = 0;
		}
	});
</script>

<div class="flex h-screen overflow-hidden">
	<Sidebar />

	<div
		bind:this={scrollContainer}
		class="relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto"
	>
		<Overlay />
		<Header />
		<main>
			{@render children()}
		</main>
	</div>
</div>
