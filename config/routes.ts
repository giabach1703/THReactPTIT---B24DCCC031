export default [
	{
		path: '/user/login',
		layout: false,
		name: 'login',
		locale: false,
		component: './user/Login',
		hideInMenu: true,
	},
	{
		path: '/user',
		redirect: '/user/login',
		hideInMenu: true,
	},

	{
		path: '/dashboard',
		name: 'Dashboard',
		locale: false,
		component: './TrangChu',
		icon: 'HomeOutlined',
	},
	{
		path: '/gioi-thieu',
		name: 'About',
		locale: false,
		component: './TienIch/GioiThieu',
		hideInMenu: true,
	},
	{
		path: '/random-user',
		name: 'RandomUser',
		locale: false,
		component: './RandomUser',
		icon: 'ArrowsAltOutlined',
	},
	{
		path: '/todo-list',
		name: 'TodoList',
		locale: false,
		icon: 'OrderedListOutlined',
		component: './TodoList',
	},
	{
		path: '/khoa-hoc',
		name: 'KhoaHoc',
		locale: false,
		icon: 'ReadOutlined',
		component: './KhoaHoc',
	},

	{
		path: '/notification/subscribe',
		exact: true,
		component: './ThongBao/Subscribe',
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/notification/check',
		exact: true,
		component: './ThongBao/Check',
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/notification',
		exact: true,
		component: './ThongBao/NotifOneSignal',
		layout: false,
		hideInMenu: true,
	},

	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/',
		redirect: '/dashboard',
		hideInMenu: true,
	},
	{
		path: '*',
		component: './exception/404',
		layout: false,
		hideInMenu: true,
	},
];
