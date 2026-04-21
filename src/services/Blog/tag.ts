import { request } from 'umi';
import type { ApiItemResponse, ApiListResponse, BlogTag } from './typing';

export async function getTags() {
	return request<ApiListResponse<BlogTag>>('/api/blog/tags', {
		method: 'GET',
	});
}

export async function createTag(data: Pick<BlogTag, 'name' | 'color'>) {
	return request<ApiItemResponse<BlogTag>>('/api/blog/tag', {
		method: 'POST',
		data,
	});
}

export async function updateTag(id: string, data: Pick<BlogTag, 'name' | 'color'>) {
	return request<ApiItemResponse<BlogTag>>('/api/blog/tag', {
		method: 'PUT',
		data: { id, ...data },
	});
}

export async function deleteTag(id: string) {
	return request<{ success: boolean; message?: string }>('/api/blog/tag', {
		method: 'DELETE',
		params: { id },
	});
}
