<script lang="ts">
	import type { NavLink } from '$lib/data/nav';
	import { sidebar } from '$lib/stores/sidebar.svelte';
	import SidebarIcon from './SidebarIcon.svelte';

	type Props = { item: NavLink; active: boolean };
	let { item, active }: Props = $props();
</script>

<li>
	<a href={item.href} class="group menu-item {active ? 'menu-item-active' : 'menu-item-inactive'}">
		<SidebarIcon
			name={item.icon}
			class={active ? 'menu-item-icon-active' : 'menu-item-icon-inactive'}
		/>
		<span class="menu-item-text {sidebar.toggle ? 'xl:hidden' : ''}">{item.label}</span>
	</a>
</li>
