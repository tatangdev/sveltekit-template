<script lang="ts">
	import Footer from '$lib/components/layout/Footer.svelte';
	import Navbar from '$lib/components/layout/Navbar.svelte';

	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col">
	<Navbar />
	<main class="flex-1">{@render children()}</main>
	<Footer />
</div>
