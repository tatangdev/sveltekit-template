<script lang="ts">
	import { resolve } from '$app/paths';
	import MoonIcon from '$lib/components/ui/icons/MoonIcon.svelte';
	import SunIcon from '$lib/components/ui/icons/SunIcon.svelte';
	import { theme } from '$lib/stores/theme.svelte';

	const homeHref = resolve('/');
	const signinHref = resolve('/console/signin');
	const signupHref = resolve('/console/signup');

	let menuOpen = $state(false);
	let menuRef = $state<HTMLDivElement | undefined>();

	$effect(() => {
		if (!menuOpen) return;

		const onClick = (e: MouseEvent) => {
			if (menuRef && !menuRef.contains(e.target as Node)) menuOpen = false;
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') menuOpen = false;
		};

		const id = setTimeout(() => document.addEventListener('click', onClick), 0);
		document.addEventListener('keydown', onKey);

		return () => {
			clearTimeout(id);
			document.removeEventListener('click', onClick);
			document.removeEventListener('keydown', onKey);
		};
	});

	const iconBtnClass =
		'flex size-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white';
	const menuItemClass =
		'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-theme-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-300';
</script>

<header
	class="sticky top-0 z-40 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
>
	<div class="relative mx-auto flex h-20 max-w-(--breakpoint-2xl) items-center px-4 md:px-6">
		<a href={homeHref} class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
			<img class="h-8 dark:hidden" src="/images/logo/logo.svg" alt="Logo" />
			<img class="hidden h-8 dark:block" src="/images/logo/logo-dark.svg" alt="Logo" />
		</a>

		<div class="ml-auto flex items-center gap-2">
			<a
				href={signinHref}
				class="hidden h-11 items-center rounded-lg px-4 text-theme-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 sm:flex dark:text-gray-300 dark:hover:bg-white/5"
			>
				Sign in
			</a>
			<a
				href={signupHref}
				class="hidden h-11 items-center rounded-lg bg-brand-500 px-4 text-theme-sm font-medium text-white shadow-theme-xs transition-colors hover:bg-brand-600 sm:flex"
			>
				Sign up
			</a>

			<button
				type="button"
				aria-label="Toggle dark mode"
				onclick={() => theme.toggle()}
				class={iconBtnClass}
			>
				<SunIcon class="hidden fill-current dark:block" />
				<MoonIcon class="fill-current dark:hidden" />
			</button>

			<div class="relative" bind:this={menuRef}>
				<button
					type="button"
					aria-label="Open menu"
					aria-haspopup="menu"
					aria-expanded={menuOpen}
					onclick={() => (menuOpen = !menuOpen)}
					class={iconBtnClass}
				>
					<svg
						class="fill-current"
						width="20"
						height="14"
						viewBox="0 0 16 12"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
					>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
							fill="currentColor"
						/>
					</svg>
				</button>

				{#if menuOpen}
					<div
						role="menu"
						class="absolute top-full right-0 z-30 mt-2 flex w-56 flex-col gap-1 rounded-2xl border border-gray-200 bg-white p-2 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
					>
						<a href={signinHref} role="menuitem" class="{menuItemClass} sm:hidden">Sign in</a>
						<a href={signupHref} role="menuitem" class="{menuItemClass} sm:hidden">Sign up</a>
						<button type="button" role="menuitem" class={menuItemClass}>Features</button>
						<button type="button" role="menuitem" class={menuItemClass}>Pricing</button>
						<button type="button" role="menuitem" class={menuItemClass}>Documentation</button>
						<button type="button" role="menuitem" class={menuItemClass}>Get help</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</header>
