<script lang="ts">
	import { resolve } from '$app/paths';
	import { isBranchActive, isLinkActive, type NavBranch } from '$lib/data/nav';
	import { sidebar } from '$lib/stores/sidebar.svelte';
	import SidebarIcon from './SidebarIcon.svelte';

	type Props = {
		item: NavBranch;
		pathname: string;
		expanded: boolean;
		onToggle: () => void;
	};
	let { item, pathname, expanded, onToggle }: Props = $props();

	const childActive = $derived(isBranchActive(item, pathname));
	const active = $derived(expanded || childActive);
</script>

<li>
	<button
		type="button"
		aria-expanded={expanded}
		onclick={onToggle}
		class="group menu-item w-full text-left {active ? 'menu-item-active' : 'menu-item-inactive'}"
	>
		<SidebarIcon
			name={item.icon}
			class={active ? 'menu-item-icon-active' : 'menu-item-icon-inactive'}
		/>

		<span class="menu-item-text {sidebar.toggle ? 'xl:hidden' : ''}">{item.label}</span>

		{#if item.isNew}
			<span class="absolute right-10 flex items-center gap-1 {sidebar.toggle ? 'xl:hidden' : ''}">
				<span
					class="menu-dropdown-badge {childActive
						? 'menu-dropdown-badge-active'
						: 'menu-dropdown-badge-inactive'}"
				>
					New
				</span>
			</span>
		{/if}

		<svg
			class="menu-item-arrow {expanded
				? 'menu-item-arrow-active'
				: 'menu-item-arrow-inactive'} {sidebar.toggle ? 'xl:hidden' : ''}"
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path
				d="M4.79175 7.39584L10.0001 12.6042L15.2084 7.39585"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>

	<div class="translate transform overflow-hidden {expanded ? 'block' : 'hidden'}">
		<ul class="menu-dropdown mt-2 flex flex-col gap-1 pl-9 {sidebar.toggle ? 'xl:hidden' : 'flex'}">
			{#each item.children as child (child.href)}
				{@const leafActive = isLinkActive(child.href, pathname)}
				<li>
					<a
						href={resolve(child.href as '/console')}
						class="group menu-dropdown-item {leafActive
							? 'menu-dropdown-item-active'
							: 'menu-dropdown-item-inactive'}"
					>
						{child.label}
						{#if child.isNew}
							<span class="absolute right-3 flex items-center gap-1">
								<span
									class="menu-dropdown-badge {leafActive
										? 'menu-dropdown-badge-active'
										: 'menu-dropdown-badge-inactive'}"
								>
									New
								</span>
							</span>
						{:else if child.isPro}
							<span class="absolute right-3 flex items-center gap-1">
								<span
									class="menu-dropdown-badge-pro {leafActive
										? 'menu-dropdown-badge-pro-active'
										: 'menu-dropdown-badge-pro-inactive'}"
								>
									Pro
								</span>
							</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</li>
