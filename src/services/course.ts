import type { CourseItem, CoursePayload, LecturerItem } from '@/pages/KhoaHoc/data';

interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
}

const BASE_URL = '/mock-api';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
	const response = await fetch(url, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(options.headers || {}),
		},
	});

	const result: ApiResponse<T> = await response.json();

	if (!response.ok || !result.success) {
		throw new Error(result.message || 'Có lỗi xảy ra');
	}

	return result.data;
}

export async function getCourses(): Promise<CourseItem[]> {
	return request<CourseItem[]>(`${BASE_URL}/courses`);
}

export async function getLecturers(): Promise<LecturerItem[]> {
	return request<LecturerItem[]>(`${BASE_URL}/lecturers`);
}

export async function createCourse(payload: CoursePayload): Promise<CourseItem> {
	return request<CourseItem>(`${BASE_URL}/courses`, {
		method: 'POST',
		body: JSON.stringify(payload),
	});
}

export async function updateCourse(id: number, payload: CoursePayload): Promise<CourseItem> {
	return request<CourseItem>(`${BASE_URL}/courses`, {
		method: 'PUT',
		body: JSON.stringify({
			id,
			...payload,
		}),
	});
}

export async function deleteCourse(id: number): Promise<{ id: number }> {
	return request<{ id: number }>(`${BASE_URL}/courses?id=${id}`, {
		method: 'DELETE',
	});
}
