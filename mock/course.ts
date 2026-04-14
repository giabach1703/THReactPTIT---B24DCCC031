type CourseStatus = 'DANG_MO' | 'DA_KET_THUC' | 'TAM_DUNG';

interface LecturerItem {
	id: number;
	name: string;
}

interface CourseItem {
	id: number;
	name: string;
	lecturerId: number;
	lecturerName: string;
	studentCount: number;
	description: string;
	status: CourseStatus;
	createdAt: string;
	updatedAt: string;
}

const lecturers: LecturerItem[] = [
	{ id: 1, name: 'Nguyễn Văn An' },
	{ id: 2, name: 'Trần Thị Bình' },
	{ id: 3, name: 'Lê Minh Cường' },
	{ id: 4, name: 'Phạm Thu Dung' },
];

let courses: CourseItem[] = [
	{
		id: 1,
		name: 'ReactJS cơ bản',
		lecturerId: 1,
		lecturerName: 'Nguyễn Văn An',
		studentCount: 28,
		description: '<p>Khóa học ReactJS cơ bản dành cho người mới bắt đầu.</p>',
		status: 'DANG_MO',
		createdAt: '2026-04-01T08:00:00.000Z',
		updatedAt: '2026-04-01T08:00:00.000Z',
	},
	{
		id: 2,
		name: 'NodeJS thực chiến',
		lecturerId: 2,
		lecturerName: 'Trần Thị Bình',
		studentCount: 0,
		description: '<p>Khóa học xây dựng REST API với NodeJS và Express.</p>',
		status: 'TAM_DUNG',
		createdAt: '2026-04-02T08:00:00.000Z',
		updatedAt: '2026-04-02T08:00:00.000Z',
	},
	{
		id: 3,
		name: 'TypeScript nâng cao',
		lecturerId: 3,
		lecturerName: 'Lê Minh Cường',
		studentCount: 42,
		description: '<p>Khóa học TypeScript nâng cao cho lập trình frontend.</p>',
		status: 'DA_KET_THUC',
		createdAt: '2026-04-03T08:00:00.000Z',
		updatedAt: '2026-04-03T08:00:00.000Z',
	},
];

function sendSuccess(res: any, data: any, message = 'Thành công') {
	res.status(200).json({
		success: true,
		data,
		message,
	});
}

function sendError(res: any, message = 'Có lỗi xảy ra', status = 400) {
	res.status(status).json({
		success: false,
		data: null,
		message,
	});
}

function getBody(req: any) {
	if (!req.body) return {};
	if (typeof req.body === 'string') {
		try {
			return JSON.parse(req.body);
		} catch (error) {
			return {};
		}
	}
	return req.body;
}

function normalizeText(value: string) {
	return String(value || '')
		.trim()
		.toLowerCase();
}

export default {
	'GET /mock-api/lecturers': (req: any, res: any) => {
		sendSuccess(res, lecturers);
	},

	'GET /mock-api/courses': (req: any, res: any) => {
		sendSuccess(res, courses);
	},

	'POST /mock-api/courses': (req: any, res: any) => {
		const body = getBody(req);
		const name = String(body.name || '').trim();
		const lecturerId = Number(body.lecturerId);
		const studentCount = Number(body.studentCount);
		const description = String(body.description || '').trim();
		const status = body.status as CourseStatus;

		if (!name || !lecturerId || description === '' || !status) {
			return sendError(res, 'Vui lòng nhập đầy đủ thông tin');
		}

		if (name.length > 100) {
			return sendError(res, 'Tên khóa học tối đa 100 ký tự');
		}

		if (!Number.isInteger(studentCount) || studentCount < 0) {
			return sendError(res, 'Số lượng học viên phải là số nguyên không âm');
		}

		const duplicate = courses.some((item) => normalizeText(item.name) === normalizeText(name));
		if (duplicate) {
			return sendError(res, 'Tên khóa học không được trùng');
		}

		const lecturer = lecturers.find((item) => item.id === lecturerId);
		if (!lecturer) {
			return sendError(res, 'Giảng viên không tồn tại');
		}

		const now = new Date().toISOString();
		const newCourse: CourseItem = {
			id: Date.now(),
			name,
			lecturerId,
			lecturerName: lecturer.name,
			studentCount,
			description,
			status,
			createdAt: now,
			updatedAt: now,
		};

		courses = [newCourse, ...courses];
		return sendSuccess(res, newCourse, 'Thêm khóa học thành công');
	},

	'PUT /mock-api/courses': (req: any, res: any) => {
		const body = getBody(req);
		const id = Number(body.id);
		const name = String(body.name || '').trim();
		const lecturerId = Number(body.lecturerId);
		const studentCount = Number(body.studentCount);
		const description = String(body.description || '').trim();
		const status = body.status as CourseStatus;

		if (!id || !name || !lecturerId || description === '' || !status) {
			return sendError(res, 'Vui lòng nhập đầy đủ thông tin');
		}

		if (name.length > 100) {
			return sendError(res, 'Tên khóa học tối đa 100 ký tự');
		}

		if (!Number.isInteger(studentCount) || studentCount < 0) {
			return sendError(res, 'Số lượng học viên phải là số nguyên không âm');
		}

		const index = courses.findIndex((item) => item.id === id);
		if (index === -1) {
			return sendError(res, 'Không tìm thấy khóa học');
		}

		const duplicate = courses.some((item) => item.id !== id && normalizeText(item.name) === normalizeText(name));
		if (duplicate) {
			return sendError(res, 'Tên khóa học không được trùng');
		}

		const lecturer = lecturers.find((item) => item.id === lecturerId);
		if (!lecturer) {
			return sendError(res, 'Giảng viên không tồn tại');
		}

		const updatedCourse: CourseItem = {
			...courses[index],
			name,
			lecturerId,
			lecturerName: lecturer.name,
			studentCount,
			description,
			status,
			updatedAt: new Date().toISOString(),
		};

		courses[index] = updatedCourse;

		return sendSuccess(res, updatedCourse, 'Cập nhật khóa học thành công');
	},

	'DELETE /mock-api/courses': (req: any, res: any) => {
		const id = Number(req.query?.id);

		if (!id) {
			return sendError(res, 'Thiếu id khóa học');
		}

		const found = courses.find((item) => item.id === id);
		if (!found) {
			return sendError(res, 'Không tìm thấy khóa học');
		}

		if (found.studentCount > 0) {
			return sendError(res, 'Chỉ được xóa khóa học chưa có học viên');
		}

		courses = courses.filter((item) => item.id !== id);

		return sendSuccess(res, { id }, 'Xóa khóa học thành công');
	},
};
