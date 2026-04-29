<script lang="ts">
	import ThemeToggle from '$lib/components/layout/ThemeToggle.svelte';

	let { children } = $props();
</script>

{@render children()}

<ThemeToggle />
