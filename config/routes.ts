export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user',
				redirect: '/user/login',
			},
		],
	},

	///////////////////////////////////
	// DEFAULT MENU
	{
		path: '/dashboard',
		name: 'Khám phá điểm đến',
		component: './TrangChu',
		icon: 'EnvironmentOutlined',
	},
	{
		path: '/lich-trinh',
		name: 'Lịch trình',
		component: './LichTrinh',
		icon: 'CalendarOutlined',
	},
	{
		path: '/ngan-sach',
		name: 'Ngân sách',
		component: './NganSach',
		icon: 'PieChartOutlined',
	},
	{
		path: '/admin',
		name: 'Admin',
		icon: 'SettingOutlined',
		routes: [
			{
				path: '/admin/diem-den',
				name: 'Quản lý điểm đến',
				component: './Admin/DiemDen',
			},
		],
	},

	// GIU LAI NEU BAN VAN MUON DUNG CAC TRANG CU
	{
		path: '/gioi-thieu',
		name: 'About',
		component: './TienIch/GioiThieu',
		hideInMenu: true,
	},
	{
		path: '/random-user',
		name: 'RandomUser',
		component: './RandomUser',
		icon: 'ArrowsAltOutlined',
	},
	{
		path: '/todo-list',
		name: 'TodoList',
		icon: 'OrderedListOutlined',
		component: './TodoList',
	},

	{
		path: '/notification',
		routes: [
			{
				path: '/notification/subscribe',
				exact: true,
				component: './ThongBao/Subscribe',
			},
			{
				path: '/notification/check',
				exact: true,
				component: './ThongBao/Check',
			},
			{
				path: '/notification',
				exact: true,
				component: './ThongBao/NotifOneSignal',
			},
		],
		layout: false,
		hideInMenu: true,
	},

	{
		path: '/',
		redirect: '/dashboard',
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		component: './exception/404',
	},
];
