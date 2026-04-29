export type Notification = {
	id: string;
	user: string;
	avatar: string;
	online: boolean;
	message: string;
	project: string;
	category: string;
	time: string;
};

export const notifications: Notification[] = [
	{
		id: 'n1',
		user: 'Terry Franci',
		avatar: '/images/user/user-02.jpg',
		online: true,
		message: 'requests permission to change',
		project: 'Project - Nganter App',
		category: 'Project',
		time: '5 min ago'
	},
	{
		id: 'n2',
		user: 'Alena Franci',
		avatar: '/images/user/user-03.jpg',
		online: true,
		message: 'requests permission to change',
		project: 'Project - Nganter App',
		category: 'Project',
		time: '8 min ago'
	},
	{
		id: 'n3',
		user: 'Jocelyn Kenter',
		avatar: '/images/user/user-04.jpg',
		online: true,
		message: 'requests permission to change',
		project: 'Project - Nganter App',
		category: 'Project',
		time: '15 min ago'
	},
	{
		id: 'n4',
		user: 'Brandon Philips',
		avatar: '/images/user/user-05.jpg',
		online: false,
		message: 'requests permission to change',
		project: 'Project - Nganter App',
		category: 'Project',
		time: '1 hr ago'
	},
	{
		id: 'n5',
		user: 'Terry Franci',
		avatar: '/images/user/user-02.jpg',
		online: true,
		message: 'requests permission to change',
		project: 'Project - Nganter App',
		category: 'Project',
		time: '5 min ago'
	},
	{
		id: 'n6',
		user: 'Alena Franci',
		avatar: '/images/user/user-03.jpg',
		online: true,
		message: 'requests permission to change',
		project: 'Project - Nganter App',
		category: 'Project',
		time: '8 min ago'
	},
	{
		id: 'n7',
		user: 'Jocelyn Kenter',
		avatar: '/images/user/user-04.jpg',
		online: true,
		message: 'requests permission to change',
		project: 'Project - Nganter App',
		category: 'Project',
		time: '15 min ago'
	},
	{
		id: 'n8',
		user: 'Brandon Philips',
		avatar: '/images/user/user-05.jpg',
		online: false,
		message: 'requests permission to change',
		project: 'Project - Nganter App',
		category: 'Project',
		time: '1 hr ago'
	}
];
