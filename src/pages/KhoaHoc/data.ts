export type CourseStatus = 'DANG_MO' | 'DA_KET_THUC' | 'TAM_DUNG';

export interface LecturerItem {
	id: number;
	name: string;
}

export interface CourseItem {
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

export interface CoursePayload {
	name: string;
	lecturerId: number;
	studentCount: number;
	description: string;
	status: CourseStatus;
}

export const COURSE_STATUS_LABEL = {
	DANG_MO: 'Đang mở',
	DA_KET_THUC: 'Đã kết thúc',
	TAM_DUNG: 'Tạm dừng',
};

export const COURSE_STATUS_OPTIONS: { label: string; value: CourseStatus }[] = [
	{ label: 'Đang mở', value: 'DANG_MO' },
	{ label: 'Đã kết thúc', value: 'DA_KET_THUC' },
	{ label: 'Tạm dừng', value: 'TAM_DUNG' },
];
