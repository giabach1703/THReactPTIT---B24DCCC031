export type PostStatus = 'draft' | 'published';

export interface BlogTag {
	id: string;
	name: string;
	color?: string;
	createdAt: string;
}

export interface BlogPost {
	id: string;
	title: string;
	slug: string;
	summary: string;
	content: string;
	coverImage: string;
	tags: string[];
	status: PostStatus;
	viewCount: number;
	createdAt: string;
	updatedAt: string;
	publishedAt?: string;
	author: {
		name: string;
		avatar: string;
		bio: string;
	};
}

export interface PostListParams {
	keyword?: string;
	status?: PostStatus | 'all';
	tag?: string;
}

export interface PostPayload {
	title: string;
	slug: string;
	summary: string;
	content: string;
	coverImage: string;
	tags: string[];
	status: PostStatus;
}

export interface ApiListResponse<T> {
	success: boolean;
	data: T[];
	total?: number;
	message?: string;
}

export interface ApiItemResponse<T> {
	success: boolean;
	data: T | null;
	message?: string;
}
