<script lang="ts">
	import { sidebar } from '$lib/stores/sidebar.svelte';
</script>

<button
	type="button"
	aria-label="Close sidebar"
	onclick={() => (sidebar.toggle = false)}
	class="fixed z-50 h-screen w-full bg-gray-900/50 {sidebar.toggle ? 'block xl:hidden' : 'hidden'}"
></button>
