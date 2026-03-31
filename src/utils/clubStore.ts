import type { ApplicationHistoryItem, ApplicationItem, ClubDatabase, ClubItem } from '@/types/club';

const STORAGE_KEY = 'club_management_database_v1';
const ADMIN_NAME = 'Admin';

const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const nowIso = () => new Date().toISOString();

const seedData = (): ClubDatabase => {
	const t = nowIso();

	const clubs: ClubItem[] = [
		{
			id: 'club_1',
			avatar: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&auto=format&fit=crop',
			name: 'CLB Công nghệ',
			foundedDate: '2022-03-10',
			description: '<p>CLB chuyên về <b>lập trình</b>, AI, web và mobile.</p>',
			president: 'Nguyễn Văn A',
			isActive: true,
			createdAt: t,
			updatedAt: t,
		},
		{
			id: 'club_2',
			avatar: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?q=80&w=400&auto=format&fit=crop',
			name: 'CLB Âm nhạc',
			foundedDate: '2021-09-15',
			description: '<p>CLB sinh hoạt về hát, guitar, piano và biểu diễn.</p>',
			president: 'Trần Thị B',
			isActive: true,
			createdAt: t,
			updatedAt: t,
		},
		{
			id: 'club_3',
			avatar: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=400&auto=format&fit=crop',
			name: 'CLB Thể thao',
			foundedDate: '2020-01-20',
			description: '<p>CLB tổ chức các hoạt động bóng đá, cầu lông, chạy bộ.</p>',
			president: 'Lê Văn C',
			isActive: false,
			createdAt: t,
			updatedAt: t,
		},
	];

	const applications: ApplicationItem[] = [
		{
			id: 'app_1',
			fullName: 'Phạm Minh Anh',
			email: 'minhanh@gmail.com',
			phone: '0901234567',
			gender: 'female',
			address: 'Hà Nội',
			talent: 'Thiết kế UI',
			clubId: 'club_1',
			reason: 'Muốn phát triển kỹ năng công nghệ và làm việc nhóm.',
			status: 'Approved',
			createdAt: t,
			updatedAt: t,
		},
		{
			id: 'app_2',
			fullName: 'Đỗ Hoàng Long',
			email: 'hoanglong@gmail.com',
			phone: '0911222333',
			gender: 'male',
			address: 'Hải Phòng',
			talent: 'Ca hát',
			clubId: 'club_2',
			reason: 'Yêu thích âm nhạc và biểu diễn sân khấu.',
			status: 'Pending',
			createdAt: t,
			updatedAt: t,
		},
		{
			id: 'app_3',
			fullName: 'Nguyễn Thu Trang',
			email: 'thutrang@gmail.com',
			phone: '0988777666',
			gender: 'female',
			address: 'Nam Định',
			talent: 'Bóng chuyền',
			clubId: 'club_3',
			reason: 'Muốn tham gia các hoạt động thể thao thường xuyên.',
			status: 'Rejected',
			rejectNote: 'Hiện tại CLB đã đủ số lượng thành viên cho đợt này.',
			createdAt: t,
			updatedAt: t,
		},
	];

	const histories: ApplicationHistoryItem[] = [
		{
			id: genId(),
			applicationId: 'app_1',
			action: 'Approved',
			note: 'Duyệt đơn thành công',
			by: ADMIN_NAME,
			createdAt: t,
		},
		{
			id: genId(),
			applicationId: 'app_3',
			action: 'Rejected',
			note: 'Hiện tại CLB đã đủ số lượng thành viên cho đợt này.',
			by: ADMIN_NAME,
			createdAt: t,
		},
	];

	return { clubs, applications, histories };
};

const readDb = (): ClubDatabase => {
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) {
		const seed = seedData();
		localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
		return seed;
	}

	try {
		return JSON.parse(raw) as ClubDatabase;
	} catch (error) {
		const seed = seedData();
		localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
		return seed;
	}
};

const writeDb = (db: ClubDatabase) => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const clubStore = {
	getDb: (): ClubDatabase => readDb(),

	reset: () => {
		const seed = seedData();
		writeDb(seed);
		return seed;
	},

	// CLUB
	getClubs: (): ClubItem[] => readDb().clubs,

	createClub: (payload: Omit<ClubItem, 'id' | 'createdAt' | 'updatedAt'>) => {
		const db = readDb();
		const item: ClubItem = {
			...payload,
			id: genId(),
			createdAt: nowIso(),
			updatedAt: nowIso(),
		};
		db.clubs.unshift(item);
		writeDb(db);
		return item;
	},

	updateClub: (id: string, payload: Omit<ClubItem, 'id' | 'createdAt' | 'updatedAt'>) => {
		const db = readDb();
		db.clubs = db.clubs.map((item) =>
			item.id === id
				? {
						...item,
						...payload,
						updatedAt: nowIso(),
				  }
				: item,
		);
		writeDb(db);
	},

	deleteClub: (id: string) => {
		const db = readDb();
		db.clubs = db.clubs.filter((item) => item.id !== id);
		db.applications = db.applications.filter((item) => item.clubId !== id);
		db.histories = db.histories.filter((h) => db.applications.some((app) => app.id === h.applicationId));
		writeDb(db);
	},

	// APPLICATION
	getApplications: (): ApplicationItem[] => readDb().applications,

	createApplication: (payload: Omit<ApplicationItem, 'id' | 'createdAt' | 'updatedAt'>) => {
		const db = readDb();
		const item: ApplicationItem = {
			...payload,
			id: genId(),
			createdAt: nowIso(),
			updatedAt: nowIso(),
		};
		db.applications.unshift(item);
		db.histories.unshift({
			id: genId(),
			applicationId: item.id,
			action: 'Created',
			note: 'Tạo mới đơn đăng ký',
			by: ADMIN_NAME,
			createdAt: nowIso(),
		});
		writeDb(db);
		return item;
	},

	updateApplication: (id: string, payload: Omit<ApplicationItem, 'id' | 'createdAt' | 'updatedAt'>) => {
		const db = readDb();
		db.applications = db.applications.map((item) =>
			item.id === id
				? {
						...item,
						...payload,
						updatedAt: nowIso(),
				  }
				: item,
		);
		db.histories.unshift({
			id: genId(),
			applicationId: id,
			action: 'Updated',
			note: 'Cập nhật thông tin đơn đăng ký',
			by: ADMIN_NAME,
			createdAt: nowIso(),
		});
		writeDb(db);
	},

	deleteApplication: (id: string) => {
		const db = readDb();
		db.applications = db.applications.filter((item) => item.id !== id);
		db.histories = db.histories.filter((item) => item.applicationId !== id);
		writeDb(db);
	},

	approveApplications: (ids: string[]) => {
		const db = readDb();

		db.applications = db.applications.map((item) => {
			if (ids.includes(item.id)) {
				db.histories.unshift({
					id: genId(),
					applicationId: item.id,
					action: 'Approved',
					note: 'Duyệt đơn đăng ký',
					by: ADMIN_NAME,
					createdAt: nowIso(),
				});

				return {
					...item,
					status: 'Approved',
					rejectNote: '',
					updatedAt: nowIso(),
				};
			}
			return item;
		});

		writeDb(db);
	},

	rejectApplications: (ids: string[], rejectNote: string) => {
		const db = readDb();

		db.applications = db.applications.map((item) => {
			if (ids.includes(item.id)) {
				db.histories.unshift({
					id: genId(),
					applicationId: item.id,
					action: 'Rejected',
					note: rejectNote,
					by: ADMIN_NAME,
					createdAt: nowIso(),
				});

				return {
					...item,
					status: 'Rejected',
					rejectNote,
					updatedAt: nowIso(),
				};
			}
			return item;
		});

		writeDb(db);
	},

	getApplicationHistories: (applicationId: string): ApplicationHistoryItem[] => {
		const db = readDb();
		return db.histories.filter((item) => item.applicationId === applicationId);
	},

	// MEMBERS
	getApprovedMembers: () => {
		return readDb().applications.filter((item) => item.status === 'Approved');
	},

	getApprovedMembersByClub: (clubId?: string) => {
		const approved = readDb().applications.filter((item) => item.status === 'Approved');
		if (!clubId) return approved;
		return approved.filter((item) => item.clubId === clubId);
	},

	transferMembers: (applicationIds: string[], newClubId: string) => {
		const db = readDb();

		db.applications = db.applications.map((item) => {
			if (applicationIds.includes(item.id) && item.status === 'Approved') {
				db.histories.unshift({
					id: genId(),
					applicationId: item.id,
					action: 'Transferred',
					note: `Chuyển sang CLB mới: ${newClubId}`,
					by: ADMIN_NAME,
					createdAt: nowIso(),
				});

				return {
					...item,
					clubId: newClubId,
					updatedAt: nowIso(),
				};
			}
			return item;
		});

		writeDb(db);
	},

	// REPORT
	getSummaryStats: () => {
		const db = readDb();
		return {
			clubCount: db.clubs.length,
			pendingCount: db.applications.filter((item) => item.status === 'Pending').length,
			approvedCount: db.applications.filter((item) => item.status === 'Approved').length,
			rejectedCount: db.applications.filter((item) => item.status === 'Rejected').length,
			totalApplications: db.applications.length,
		};
	},

	getChartData: () => {
		const db = readDb();
		const statuses = ['Pending', 'Approved', 'Rejected'];

		const result: { clubName: string; status: string; value: number }[] = [];

		db.clubs.forEach((club) => {
			statuses.forEach((status) => {
				result.push({
					clubName: club.name,
					status,
					value: db.applications.filter((app) => app.clubId === club.id && app.status === status).length,
				});
			});
		});

		return result;
	},

	getClubName: (clubId: string) => {
		const club = readDb().clubs.find((item) => item.id === clubId);
		return club?.name || 'Không xác định';
	},
};
