<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
</script>

<svelte:head>
	<title>Home | TailAdmin</title>
</svelte:head>

<section class="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center md:px-6">
	<h1
		class="text-title-sm font-bold text-gray-900 sm:text-title-md lg:text-title-lg dark:text-white"
	>
		Welcome to your starter
	</h1>
	<p class="mt-5 max-w-2xl text-base text-gray-500 dark:text-gray-400">
		A SvelteKit + NestJS template scaffolded with Zod validation, Drizzle ORM, and a
		TailAdmin-styled admin console.
	</p>
	<div class="mt-8 flex flex-wrap items-center justify-center gap-3">
		<button
			type="button"
			onclick={() => auth.openModal('signup')}
			class="flex h-11 items-center rounded-xl bg-brand-500 px-5 text-theme-sm font-medium text-white shadow-theme-xs transition-colors hover:bg-brand-600"
		>
			Get started
		</button>
		<button
			type="button"
			onclick={() => auth.openModal('login')}
			class="flex h-11 items-center rounded-xl border border-gray-300 bg-white px-5 text-theme-sm font-medium text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
		>
			Sign in
		</button>
	</div>
</section>
