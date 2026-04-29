<script lang="ts">
	let { children } = $props();
</script>

<div class="mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6">
	{@render children()}
</div>
