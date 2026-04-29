<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Logo from '$lib/components/ui/icons/Logo.svelte';
	import { isBranch, isBranchActive, NAV } from '$lib/data/nav';
	import { persisted } from '$lib/stores/persisted.svelte';
	import { sidebar } from '$lib/stores/sidebar.svelte';
	import NavGroup from './sidebar/NavGroup.svelte';

	const expanded = persisted<string>('sidebar-selected', '');

	const pathname = $derived(page.url.pathname);

	$effect(() => {
		for (const group of NAV) {
			for (const item of group.items) {
				if (isBranch(item) && isBranchActive(item, pathname) && expanded.value !== item.label) {
					expanded.value = item.label;
					return;
				}
			}
		}
	});

	function toggleBranch(label: string) {
		expanded.value = expanded.value === label ? '' : label;
	}
</script>

<aside
	class="sidebar fixed top-0 left-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-auto border-r border-gray-200 bg-white px-5 transition-all duration-300 xl:static xl:translate-x-0 dark:border-gray-800 dark:bg-black {sidebar.toggle
		? 'translate-x-0 xl:w-22.5'
		: '-translate-x-full'}"
>
	<div
		class="sidebar-header flex items-center gap-2 pt-8 pb-7 {sidebar.toggle
			? 'justify-center'
			: 'justify-between'}"
	>
		<a href={resolve('/console')}>
			<span class="logo flex items-center gap-2.5 {sidebar.toggle ? 'hidden' : ''}">
				<Logo class="size-9 text-brand-500" />
				<span class="text-2xl font-bold text-gray-900 dark:text-white">Starter</span>
			</span>

			<span class="logo-icon {sidebar.toggle ? 'xl:block' : 'hidden'}">
				<Logo class="size-9 text-brand-500" />
			</span>
		</a>
	</div>

	<div class="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
		<nav>
			{#each NAV as group (group.title)}
				<NavGroup {group} {pathname} expandedLabel={expanded.value} onToggleBranch={toggleBranch} />
			{/each}
		</nav>
	</div>
</aside>
