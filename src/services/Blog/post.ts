import { request } from 'umi';
import type { ApiItemResponse, ApiListResponse, BlogPost, PostListParams, PostPayload } from './typing.ts';
export async function getPosts(params?: PostListParams) {
	return request<ApiListResponse<BlogPost>>('/api/blog/posts', {
		method: 'GET',
		params,
	});
}

export async function getPostBySlug(slug: string) {
	return request<ApiItemResponse<BlogPost>>('/api/blog/post', {
		method: 'GET',
		params: { slug },
	});
}

export async function createPost(data: PostPayload) {
	return request<ApiItemResponse<BlogPost>>('/api/blog/post', {
		method: 'POST',
		data,
	});
}

export async function updatePost(id: string, data: PostPayload) {
	return request<ApiItemResponse<BlogPost>>('/api/blog/post', {
		method: 'PUT',
		data: { id, ...data },
	});
}

export async function deletePost(id: string) {
	return request<{ success: boolean; message?: string }>('/api/blog/post', {
		method: 'DELETE',
		params: { id },
	});
}

export async function increaseViewCount(id: string) {
	return request<ApiItemResponse<BlogPost>>('/api/blog/post/view', {
		method: 'POST',
		data: { id },
	});
}
