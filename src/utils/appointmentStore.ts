import dayjs from 'dayjs';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'DONE' | 'CANCELLED';

export interface Employee {
	id: string;
	name: string;
	specialty: string;
	phone?: string;
	maxCustomersPerDay: number;
	workDays: number[];
	startTime: string;
	endTime: string;
}

export interface ServiceItem {
	id: string;
	name: string;
	price: number;
	duration: number;
	description?: string;
}

export interface Appointment {
	id: string;
	customerName: string;
	customerPhone: string;
	employeeId: string;
	serviceId: string;
	date: string;
	startTime: string;
	endTime: string;
	status: AppointmentStatus;
	note?: string;
}

export interface ReviewItem {
	id: string;
	appointmentId: string;
	employeeId: string;
	serviceId: string;
	customerName: string;
	rating: number;
	content: string;
	reply?: string;
	createdAt: string;
}

const STORAGE_KEYS = {
	employees: 'th03_employees',
	services: 'th03_services',
	appointments: 'th03_appointments',
	reviews: 'th03_reviews',
};

const seedEmployees: Employee[] = [
	{
		id: 'emp_1',
		name: 'Nguyễn Văn An',
		specialty: 'Cắt tóc nam',
		phone: '0901000001',
		maxCustomersPerDay: 8,
		workDays: [1, 2, 3, 4, 5, 6],
		startTime: '09:00',
		endTime: '17:00',
	},
	{
		id: 'emp_2',
		name: 'Trần Thị Bình',
		specialty: 'Spa chăm sóc da',
		phone: '0901000002',
		maxCustomersPerDay: 6,
		workDays: [1, 3, 5, 6],
		startTime: '09:00',
		endTime: '18:00',
	},
	{
		id: 'emp_3',
		name: 'Lê Minh Châu',
		specialty: 'Khám tổng quát',
		phone: '0901000003',
		maxCustomersPerDay: 10,
		workDays: [2, 4, 6],
		startTime: '08:00',
		endTime: '16:00',
	},
];

const seedServices: ServiceItem[] = [
	{
		id: 'srv_1',
		name: 'Cắt tóc cơ bản',
		price: 80000,
		duration: 45,
		description: 'Cắt tóc, tạo kiểu cơ bản',
	},
	{
		id: 'srv_2',
		name: 'Gội đầu thư giãn',
		price: 120000,
		duration: 60,
		description: 'Gội đầu kết hợp massage thư giãn',
	},
	{
		id: 'srv_3',
		name: 'Chăm sóc da mặt',
		price: 350000,
		duration: 90,
		description: 'Làm sạch, dưỡng ẩm và chăm sóc da',
	},
	{
		id: 'srv_4',
		name: 'Khám tổng quát',
		price: 500000,
		duration: 30,
		description: 'Khám sức khỏe tổng quát',
	},
];

function ensureSeed<T>(key: string, seed: T[]) {
	const raw = localStorage.getItem(key);
	if (!raw) {
		localStorage.setItem(key, JSON.stringify(seed));
	}
}

export function initStore() {
	ensureSeed(STORAGE_KEYS.employees, seedEmployees);
	ensureSeed(STORAGE_KEYS.services, seedServices);
	ensureSeed(STORAGE_KEYS.appointments, []);
	ensureSeed(STORAGE_KEYS.reviews, []);
}

function read<T>(key: string): T[] {
	initStore();
	return JSON.parse(localStorage.getItem(key) || '[]');
}

function write<T>(key: string, data: T[]) {
	localStorage.setItem(key, JSON.stringify(data));
}

function uuid(prefix: string) {
	return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function formatCurrency(value: number) {
	return `${value.toLocaleString('vi-VN')} đ`;
}

export function getWeekdayLabel(day: number) {
	const map: Record<number, string> = {
		0: 'CN',
		1: 'T2',
		2: 'T3',
		3: 'T4',
		4: 'T5',
		5: 'T6',
		6: 'T7',
	};
	return map[day] || '';
}

export function getStatusLabel(status: AppointmentStatus) {
	const map: Record<AppointmentStatus, string> = {
		PENDING: 'Chờ duyệt',
		CONFIRMED: 'Xác nhận',
		DONE: 'Hoàn thành',
		CANCELLED: 'Hủy',
	};
	return map[status];
}

export function getStatusColor(status: AppointmentStatus) {
	const map: Record<AppointmentStatus, string> = {
		PENDING: 'gold',
		CONFIRMED: 'blue',
		DONE: 'green',
		CANCELLED: 'red',
	};
	return map[status];
}

export function timeToMinutes(time: string) {
	const [h, m] = time.split(':').map(Number);
	return h * 60 + m;
}

export function calcEndTime(startTime: string, duration: number) {
	const total = timeToMinutes(startTime) + duration;
	const h = Math.floor(total / 60)
		.toString()
		.padStart(2, '0');
	const m = Math.floor(total % 60)
		.toString()
		.padStart(2, '0');
	return `${h}:${m}`;
}

function isOverlap(startA: string, endA: string, startB: string, endB: string) {
	const a1 = timeToMinutes(startA);
	const a2 = timeToMinutes(endA);
	const b1 = timeToMinutes(startB);
	const b2 = timeToMinutes(endB);
	return a1 < b2 && b1 < a2;
}

export function getEmployees() {
	return read<Employee>(STORAGE_KEYS.employees);
}

export function saveEmployee(payload: Omit<Employee, 'id'> & { id?: string }) {
	const list = getEmployees();
	if (payload.id) {
		const next = list.map((item) => (item.id === payload.id ? { ...item, ...payload } : item));
		write(STORAGE_KEYS.employees, next);
		return;
	}
	list.push({ ...payload, id: uuid('emp') });
	write(STORAGE_KEYS.employees, list);
}

export function deleteEmployee(id: string) {
	write(
		STORAGE_KEYS.employees,
		getEmployees().filter((item) => item.id !== id),
	);
}

export function getServices() {
	return read<ServiceItem>(STORAGE_KEYS.services);
}

export function saveService(payload: Omit<ServiceItem, 'id'> & { id?: string }) {
	const list = getServices();
	if (payload.id) {
		const next = list.map((item) => (item.id === payload.id ? { ...item, ...payload } : item));
		write(STORAGE_KEYS.services, next);
		return;
	}
	list.push({ ...payload, id: uuid('srv') });
	write(STORAGE_KEYS.services, list);
}

export function deleteService(id: string) {
	write(
		STORAGE_KEYS.services,
		getServices().filter((item) => item.id !== id),
	);
}

export function getAppointments() {
	return read<Appointment>(STORAGE_KEYS.appointments);
}

export function saveAppointment(payload: Omit<Appointment, 'id'> & { id?: string }) {
	const appointments = getAppointments();
	const error = validateAppointment(payload);
	if (error) {
		throw new Error(error);
	}

	if (payload.id) {
		const next = appointments.map((item) => (item.id === payload.id ? { ...item, ...payload } : item));
		write(STORAGE_KEYS.appointments, next);
		return;
	}

	appointments.push({ ...payload, id: uuid('apt') });
	write(STORAGE_KEYS.appointments, appointments);
}

export function deleteAppointment(id: string) {
	write(
		STORAGE_KEYS.appointments,
		getAppointments().filter((item) => item.id !== id),
	);
}

export function validateAppointment(payload: Omit<Appointment, 'id'> & { id?: string }) {
	const employees = getEmployees();
	const services = getServices();
	const appointments = getAppointments();

	const employee = employees.find((item) => item.id === payload.employeeId);
	if (!employee) return 'Nhân viên không tồn tại';

	const service = services.find((item) => item.id === payload.serviceId);
	if (!service) return 'Dịch vụ không tồn tại';

	const selectedDay = dayjs(payload.date).day();
	if (!employee.workDays.includes(selectedDay)) {
		return 'Nhân viên không làm việc vào ngày đã chọn';
	}

	if (
		timeToMinutes(payload.startTime) < timeToMinutes(employee.startTime) ||
		timeToMinutes(payload.endTime) > timeToMinutes(employee.endTime)
	) {
		return 'Khung giờ đặt vượt ngoài lịch làm việc của nhân viên';
	}

	const sameDayAppointments = appointments.filter(
		(item) =>
			item.employeeId === payload.employeeId &&
			item.date === payload.date &&
			item.status !== 'CANCELLED' &&
			item.id !== payload.id,
	);

	const overlapped = sameDayAppointments.find((item) =>
		isOverlap(payload.startTime, payload.endTime, item.startTime, item.endTime),
	);

	if (overlapped) {
		return 'Khung giờ này đã bị trùng lịch';
	}

	if (sameDayAppointments.length >= employee.maxCustomersPerDay) {
		return 'Nhân viên đã đạt giới hạn số khách trong ngày';
	}

	return '';
}

export function getReviews() {
	return read<ReviewItem>(STORAGE_KEYS.reviews);
}

export function saveReview(payload: Omit<ReviewItem, 'id' | 'createdAt'> & { id?: string }) {
	const list = getReviews();
	if (payload.id) {
		const next = list.map((item) => (item.id === payload.id ? { ...item, ...payload } : item));
		write(STORAGE_KEYS.reviews, next);
		return;
	}

	list.push({
		...payload,
		id: uuid('rvw'),
		createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
	});
	write(STORAGE_KEYS.reviews, list);
}

export function getAverageRatingByEmployee(employeeId: string) {
	const reviews = getReviews().filter((item) => item.employeeId === employeeId);
	if (!reviews.length) return 0;
	const total = reviews.reduce((sum, item) => sum + item.rating, 0);
	return Number((total / reviews.length).toFixed(1));
}

export function getEmployeeName(employeeId: string) {
	return getEmployees().find((item) => item.id === employeeId)?.name || '';
}

export function getServiceName(serviceId: string) {
	return getServices().find((item) => item.id === serviceId)?.name || '';
}

export function getSummaryStats() {
	const employees = getEmployees();
	const services = getServices();
	const appointments = getAppointments();
	const reviews = getReviews();

	const totalRevenue = appointments
		.filter((item) => item.status === 'DONE')
		.reduce((sum, item) => {
			const service = services.find((s) => s.id === item.serviceId);
			return sum + (service?.price || 0);
		}, 0);

	return {
		employees: employees.length,
		services: services.length,
		appointments: appointments.length,
		pendingAppointments: appointments.filter((item) => item.status === 'PENDING').length,
		doneAppointments: appointments.filter((item) => item.status === 'DONE').length,
		reviews: reviews.length,
		totalRevenue,
	};
}

export function getRevenueStats() {
	const services = getServices();
	const employees = getEmployees();
	const appointments = getAppointments();
	const doneAppointments = appointments.filter((item) => item.status === 'DONE');

	const byService = services.map((service) => {
		const matched = doneAppointments.filter((item) => item.serviceId === service.id);
		return {
			key: service.id,
			name: service.name,
			totalAppointments: matched.length,
			revenue: matched.length * service.price,
		};
	});

	const byEmployee = employees.map((employee) => {
		const matched = doneAppointments.filter((item) => item.employeeId === employee.id);
		const revenue = matched.reduce((sum, item) => {
			const service = services.find((s) => s.id === item.serviceId);
			return sum + (service?.price || 0);
		}, 0);

		return {
			key: employee.id,
			name: employee.name,
			specialty: employee.specialty,
			totalAppointments: matched.length,
			revenue,
			averageRating: getAverageRatingByEmployee(employee.id),
		};
	});

	const byDayMap: Record<string, number> = {};
	const byMonthMap: Record<string, number> = {};

	appointments.forEach((item) => {
		byDayMap[item.date] = (byDayMap[item.date] || 0) + 1;
		const month = dayjs(item.date).format('YYYY-MM');
		byMonthMap[month] = (byMonthMap[month] || 0) + 1;
	});

	const byDay = Object.keys(byDayMap)
		.sort()
		.map((date) => ({
			key: date,
			date,
			totalAppointments: byDayMap[date],
		}));

	const byMonth = Object.keys(byMonthMap)
		.sort()
		.map((month) => ({
			key: month,
			month,
			totalAppointments: byMonthMap[month],
		}));

	return { byService, byEmployee, byDay, byMonth };
}
