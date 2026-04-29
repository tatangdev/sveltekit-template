<script lang="ts">
	import ConsoleLayout from '$lib/components/layout/ConsoleLayout.svelte';

	let { children } = $props();
</script>

<ConsoleLayout>
	{@render children()}
</ConsoleLayout>
