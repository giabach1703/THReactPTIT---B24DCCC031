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
		name: 'Dashboard',
		component: './TrangChu',
		icon: 'HomeOutlined',
	},
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
		path: '/product-manage',
		name: 'ProductManage',
		component: './ProductManage',
		layout: false,
	},

	{
		path: '/so-van-bang',
		name: 'Sổ văn bằng',
		component: './SoVanBang',
		icon: 'BookOutlined',
	},
	{
		path: '/quyet-dinh-tot-nghiep',
		name: 'Quyết định tốt nghiệp',
		component: './QuyetDinhTotNghiep',
		icon: 'FileTextOutlined',
	},
	{
		path: '/cau-hinh-phu-luc',
		name: 'Cấu hình phụ lục',
		component: './CauHinhPhuLuc',
		icon: 'SettingOutlined',
	},
	{
		path: '/thong-tin-van-bang',
		name: 'Thông tin văn bằng',
		component: './ThongTinVanBang',
		icon: 'IdcardOutlined',
	},
	{
		path: '/tra-cuu-van-bang',
		name: 'Tra cứu văn bằng',
		component: './TraCuuVanBang',
		icon: 'SearchOutlined',
	},

	// DANH MUC HE THONG
	// {
	// 	name: 'DanhMuc',
	// 	path: '/danh-muc',
	// 	icon: 'copy',
	// 	routes: [
	// 		{
	// 			name: 'ChucVu',
	// 			path: 'chuc-vu',
	// 			component: './DanhMuc/ChucVu',
	// 		},
	// 	],
	// },

	{
		path: '/notification',
		routes: [
			{
				path: './subscribe',
				exact: true,
				component: './ThongBao/Subscribe',
			},
			{
				path: './check',
				exact: true,
				component: './ThongBao/Check',
			},
			{
				path: './',
				exact: true,
				component: './ThongBao/NotifOneSignal',
			},
		],
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/',
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
