export type IconName =
	| 'dashboard'
	| 'aiAssistant'
	| 'ecommerce'
	| 'calendar'
	| 'userCircle'
	| 'taskList'
	| 'forms'
	| 'tables'
	| 'pages'
	| 'chat'
	| 'support'
	| 'email'
	| 'charts'
	| 'uiElements'
	| 'authentication';

export type NavLeaf = {
	label: string;
	href: string;
	isPro?: boolean;
	isNew?: boolean;
};

export type NavBranch = {
	label: string;
	icon: IconName;
	isNew?: boolean;
	children: NavLeaf[];
};

export type NavLink = {
	label: string;
	icon: IconName;
	href: string;
};

export type NavItem = NavBranch | NavLink;

export function isBranch(item: NavItem): item is NavBranch {
	return 'children' in item;
}

export type NavGroup = { title: string; items: NavItem[] };

export const NAV: NavGroup[] = [
	{
		title: 'MENU',
		items: [
			{ label: 'Dashboard', icon: 'dashboard', href: '/console' },
			{ label: 'User Profile', icon: 'userCircle', href: '/console/profile' },
			{
				label: 'Forms',
				icon: 'forms',
				children: [
					{ label: 'Form Elements', href: '/console/form-elements' },
					{ label: 'Form Layout', href: '/console/form-layout' }
				]
			},
			{
				label: 'Tables',
				icon: 'tables',
				children: [{ label: 'Basic Tables', href: '/console/basic-tables' }]
			}
		]
	},
	{
		title: 'OTHERS',
		items: [
			{
				label: 'Authentication',
				icon: 'authentication',
				children: [
					{ label: 'Sign In', href: '/console/signin' },
					{ label: 'Sign Up', href: '/console/signup' }
				]
			}
		]
	}
];

export function isLinkActive(href: string, pathname: string): boolean {
	if (href === '/console') return pathname === '/console';
	return pathname === href;
}

export function isBranchActive(branch: NavBranch, pathname: string): boolean {
	return branch.children.some((c) => isLinkActive(c.href, pathname));
}
