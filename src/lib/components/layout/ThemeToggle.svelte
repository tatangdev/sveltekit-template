<script lang="ts">
	import MoonIcon from '$lib/components/ui/icons/MoonIcon.svelte';
	import SunIcon from '$lib/components/ui/icons/SunIcon.svelte';
	import { theme } from '$lib/stores/theme.svelte';
</script>

<div class="fixed right-6 bottom-6 z-50">
	<button
		onclick={() => theme.toggle()}
		aria-label="Toggle theme"
		class="inline-flex size-14 items-center justify-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-600"
	>
		<SunIcon class="hidden fill-current dark:block" />
		<MoonIcon class="fill-current dark:hidden" />
	</button>
</div>
