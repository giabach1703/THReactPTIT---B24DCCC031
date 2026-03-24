export type DataType = 'string' | 'number' | 'date';

export interface DegreeBook {
	id: string;
	year: number;
	name: string;
	description?: string;
	createdAt: string;
}

export interface GraduationDecision {
	id: string;
	decisionNo: string;
	issuedDate: string;
	summary: string;
	bookId: string;
	lookupCount: number;
	createdAt: string;
}

export interface AppendixField {
	id: string;
	name: string;
	key: string;
	dataType: DataType;
	createdAt: string;
}

export interface DegreeRecord {
	id: string;
	bookId: string;
	decisionId: string;
	entryNo: number;
	degreeNo: string;
	studentId: string;
	fullName: string;
	birthDate: string;
	extras: Record<string, any>;
	createdAt: string;
}

const BOOKS_KEY = 'degree_books';
const DECISIONS_KEY = 'graduation_decisions';
const FIELDS_KEY = 'appendix_fields';
const DEGREES_KEY = 'degree_records';

function canUseStorage() {
	return typeof window !== 'undefined' && !!window.localStorage;
}

function readStorage<T>(key: string, defaultValue: T): T {
	if (!canUseStorage()) return defaultValue;
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : defaultValue;
	} catch (error) {
		return defaultValue;
	}
}

function writeStorage<T>(key: string, value: T) {
	if (!canUseStorage()) return;
	localStorage.setItem(key, JSON.stringify(value));
}

export function createId() {
	return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeFieldKey(name: string) {
	return name
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/đ/g, 'd')
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '');
}

export function getBooks(): DegreeBook[] {
	return readStorage<DegreeBook[]>(BOOKS_KEY, []);
}

export function saveBooks(data: DegreeBook[]) {
	writeStorage(BOOKS_KEY, data);
}

export function getDecisions(): GraduationDecision[] {
	return readStorage<GraduationDecision[]>(DECISIONS_KEY, []);
}

export function saveDecisions(data: GraduationDecision[]) {
	writeStorage(DECISIONS_KEY, data);
}

export function getAppendixFields(): AppendixField[] {
	return readStorage<AppendixField[]>(FIELDS_KEY, []);
}

export function saveAppendixFields(data: AppendixField[]) {
	writeStorage(FIELDS_KEY, data);
}

export function getDegreeRecords(): DegreeRecord[] {
	return readStorage<DegreeRecord[]>(DEGREES_KEY, []);
}

export function saveDegreeRecords(data: DegreeRecord[]) {
	writeStorage(DEGREES_KEY, data);
}

export function getBookById(id: string) {
	return getBooks().find((item) => item.id === id);
}

export function getDecisionById(id: string) {
	return getDecisions().find((item) => item.id === id);
}

export function getNextEntryNo(bookId: string) {
	const records = getDegreeRecords().filter((item) => item.bookId === bookId);
	if (!records.length) return 1;
	return Math.max(...records.map((item) => Number(item.entryNo) || 0)) + 1;
}

export function increaseDecisionLookup(decisionId: string) {
	const decisions = getDecisions();
	const next = decisions.map((item) =>
		item.id === decisionId ? { ...item, lookupCount: (item.lookupCount || 0) + 1 } : item,
	);
	saveDecisions(next);
	return next.find((item) => item.id === decisionId);
}

export function initializeDemoData() {
	const books = getBooks();
	const decisions = getDecisions();
	const fields = getAppendixFields();
	const degrees = getDegreeRecords();

	if (books.length || decisions.length || fields.length || degrees.length) return;

	const bookId1 = createId();
	const bookId2 = createId();
	const decisionId1 = createId();
	const decisionId2 = createId();

	const demoBooks: DegreeBook[] = [
		{
			id: bookId1,
			year: 2025,
			name: 'Sổ văn bằng năm 2025',
			description: 'Sổ quản lý văn bằng tốt nghiệp năm 2025',
			createdAt: new Date().toISOString(),
		},
		{
			id: bookId2,
			year: 2026,
			name: 'Sổ văn bằng năm 2026',
			description: 'Sổ quản lý văn bằng tốt nghiệp năm 2026',
			createdAt: new Date().toISOString(),
		},
	];

	const demoDecisions: GraduationDecision[] = [
		{
			id: decisionId1,
			decisionNo: 'QD-2025-01',
			issuedDate: '2025-07-20',
			summary: 'Công nhận tốt nghiệp đợt 1 năm 2025',
			bookId: bookId1,
			lookupCount: 0,
			createdAt: new Date().toISOString(),
		},
		{
			id: decisionId2,
			decisionNo: 'QD-2026-01',
			issuedDate: '2026-07-18',
			summary: 'Công nhận tốt nghiệp đợt 1 năm 2026',
			bookId: bookId2,
			lookupCount: 0,
			createdAt: new Date().toISOString(),
		},
	];

	const demoFields: AppendixField[] = [
		{
			id: createId(),
			name: 'Dân tộc',
			key: 'dan_toc',
			dataType: 'string',
			createdAt: new Date().toISOString(),
		},
		{
			id: createId(),
			name: 'Nơi sinh',
			key: 'noi_sinh',
			dataType: 'string',
			createdAt: new Date().toISOString(),
		},
		{
			id: createId(),
			name: 'Điểm trung bình',
			key: 'diem_trung_binh',
			dataType: 'number',
			createdAt: new Date().toISOString(),
		},
		{
			id: createId(),
			name: 'Ngày nhập học',
			key: 'ngay_nhap_hoc',
			dataType: 'date',
			createdAt: new Date().toISOString(),
		},
	];

	const demoDegrees: DegreeRecord[] = [
		{
			id: createId(),
			bookId: bookId1,
			decisionId: decisionId1,
			entryNo: 1,
			degreeNo: 'VB2025001',
			studentId: 'B20DCCN001',
			fullName: 'Nguyễn Văn A',
			birthDate: '2002-01-15',
			extras: {
				dan_toc: 'Kinh',
				noi_sinh: 'Hà Nội',
				diem_trung_binh: 3.45,
				ngay_nhap_hoc: '2020-09-05',
			},
			createdAt: new Date().toISOString(),
		},
		{
			id: createId(),
			bookId: bookId2,
			decisionId: decisionId2,
			entryNo: 1,
			degreeNo: 'VB2026001',
			studentId: 'B21DCCN015',
			fullName: 'Trần Thị B',
			birthDate: '2003-04-11',
			extras: {
				dan_toc: 'Kinh',
				noi_sinh: 'Hải Phòng',
				diem_trung_binh: 3.72,
				ngay_nhap_hoc: '2021-09-06',
			},
			createdAt: new Date().toISOString(),
		},
	];

	saveBooks(demoBooks);
	saveDecisions(demoDecisions);
	saveAppendixFields(demoFields);
	saveDegreeRecords(demoDegrees);
}
