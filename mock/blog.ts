import { Request, Response } from 'express';

type PostStatus = 'draft' | 'published';

interface BlogTag {
	id: string;
	name: string;
	color?: string;
	createdAt: string;
}

interface BlogPost {
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

const authorInfo = {
	name: 'Đỗ Đăng Khoa',
	avatar: 'https://i.pravatar.cc/300?img=12',
	bio: 'Tác giả blog cá nhân, yêu thích chia sẻ kiến thức về công nghệ, quản trị và phát triển bản thân.',
};

let tags: BlogTag[] = [
	{ id: 'tag-1', name: 'ReactJS', color: 'blue', createdAt: '2026-04-01T08:00:00.000Z' },
	{ id: 'tag-2', name: 'UmiJS', color: 'cyan', createdAt: '2026-04-01T08:00:00.000Z' },
	{ id: 'tag-3', name: 'Ant Design', color: 'geekblue', createdAt: '2026-04-01T08:00:00.000Z' },
	{ id: 'tag-4', name: 'JavaScript', color: 'gold', createdAt: '2026-04-01T08:00:00.000Z' },
	{ id: 'tag-5', name: 'TypeScript', color: 'volcano', createdAt: '2026-04-01T08:00:00.000Z' },
	{ id: 'tag-6', name: 'Frontend', color: 'purple', createdAt: '2026-04-01T08:00:00.000Z' },
	{ id: 'tag-7', name: 'Kinh nghiệm học tập', color: 'green', createdAt: '2026-04-01T08:00:00.000Z' },
];

const makePost = (id: number, title: string, tagList: string[], status: PostStatus, daysAgo: number): BlogPost => {
	const created = new Date();
	created.setDate(created.getDate() - daysAgo);

	const markdown = `# ${title}

## Mở đầu

Đây là bài viết chia sẻ về **${title}**. Nội dung được viết theo định dạng Markdown để hiển thị đúng ở trang chi tiết.

## Nội dung chính

- Tóm tắt khái niệm quan trọng
- Chia sẻ kinh nghiệm thực hành
- Các lỗi thường gặp và cách xử lý

## Ví dụ ngắn

\`\`\`ts
const message = 'Hello Blog';
console.log(message);
\`\`\`

## Kết luận

Hy vọng bài viết này giúp bạn hiểu rõ hơn và có thể áp dụng ngay vào bài tập thực hành của mình.
`;

	return {
		id: `post-${id}`,
		title,
		slug: title
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/đ/g, 'd')
			.replace(/[^a-z0-9\s-]/g, '')
			.trim()
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-'),
		summary: `Bài viết chia sẻ ngắn gọn và dễ hiểu về chủ đề "${title}", phù hợp cho người mới bắt đầu.`,
		content: markdown,
		coverImage: `https://picsum.photos/seed/blog-${id}/900/500`,
		tags: tagList,
		status,
		viewCount: 20 + id * 7,
		createdAt: created.toISOString(),
		updatedAt: created.toISOString(),
		publishedAt: status === 'published' ? created.toISOString() : undefined,
		author: authorInfo,
	};
};

let posts: BlogPost[] = [
	makePost(1, 'Hướng dẫn bắt đầu với ReactJS cho người mới', ['ReactJS', 'Frontend'], 'published', 1),
	makePost(2, 'Cách tổ chức project UmiJS gọn gàng', ['UmiJS', 'Frontend'], 'published', 2),
	makePost(3, 'Sử dụng Ant Design để dựng giao diện nhanh', ['Ant Design', 'Frontend'], 'published', 3),
	makePost(4, 'Phân biệt var, let và const trong JavaScript', ['JavaScript'], 'published', 4),
	makePost(5, 'TypeScript giúp code an toàn hơn như thế nào', ['TypeScript', 'JavaScript'], 'published', 5),
	makePost(6, 'Kinh nghiệm học lập trình web hiệu quả', ['Kinh nghiệm học tập'], 'published', 6),
	makePost(7, 'Tối ưu component React tránh render thừa', ['ReactJS', 'Frontend'], 'published', 7),
	makePost(8, 'Cách quản lý route trong UmiJS', ['UmiJS'], 'published', 8),
	makePost(9, 'Làm việc với Form trong Ant Design', ['Ant Design'], 'published', 9),
	makePost(10, 'Các hàm array thường dùng trong JavaScript', ['JavaScript'], 'published', 10),
	makePost(11, 'Các kiểu dữ liệu cơ bản trong TypeScript', ['TypeScript'], 'draft', 11),
	makePost(12, 'Checklist tự học Frontend cho sinh viên', ['Frontend', 'Kinh nghiệm học tập'], 'draft', 12),
];

const parseBody = (req: Request) => {
	if (!req.body) return {};
	if (typeof req.body === 'string') {
		try {
			return JSON.parse(req.body);
		} catch (error) {
			return {};
		}
	}
	return req.body;
};

export default {
	'GET /api/blog/posts': (req: Request, res: Response) => {
		const { keyword, status, tag } = req.query as {
			keyword?: string;
			status?: PostStatus | 'all';
			tag?: string;
		};

		let result = [...posts];

		if (status && status !== 'all') {
			result = result.filter((item) => item.status === status);
		}

		if (tag) {
			result = result.filter((item) => item.tags.includes(tag));
		}

		if (keyword) {
			const q = keyword.toLowerCase();
			result = result.filter(
				(item) =>
					item.title.toLowerCase().includes(q) ||
					item.summary.toLowerCase().includes(q) ||
					item.content.toLowerCase().includes(q),
			);
		}

		result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

		res.send({
			success: true,
			data: result,
			total: result.length,
		});
	},

	'GET /api/blog/post': (req: Request, res: Response) => {
		const { slug } = req.query as { slug?: string };
		const post = posts.find((item) => item.slug === slug) || null;

		res.send({
			success: true,
			data: post,
		});
	},

	'POST /api/blog/post': (req: Request, res: Response) => {
		const body = parseBody(req);
		const now = new Date().toISOString();

		const newPost: BlogPost = {
			id: `post-${Date.now()}`,
			title: body.title,
			slug: body.slug,
			summary: body.summary,
			content: body.content,
			coverImage: body.coverImage,
			tags: body.tags || [],
			status: body.status,
			viewCount: 0,
			createdAt: now,
			updatedAt: now,
			publishedAt: body.status === 'published' ? now : undefined,
			author: authorInfo,
		};

		posts.unshift(newPost);

		res.send({
			success: true,
			data: newPost,
			message: 'Tạo bài viết thành công',
		});
	},

	'PUT /api/blog/post': (req: Request, res: Response) => {
		const body = parseBody(req);
		const index = posts.findIndex((item) => item.id === body.id);

		if (index === -1) {
			res.send({
				success: false,
				data: null,
				message: 'Không tìm thấy bài viết',
			});
			return;
		}

		const oldPost = posts[index];
		const updatedPost: BlogPost = {
			...oldPost,
			title: body.title,
			slug: body.slug,
			summary: body.summary,
			content: body.content,
			coverImage: body.coverImage,
			tags: body.tags || [],
			status: body.status,
			updatedAt: new Date().toISOString(),
			publishedAt: body.status === 'published' ? oldPost.publishedAt || new Date().toISOString() : undefined,
		};

		posts[index] = updatedPost;

		res.send({
			success: true,
			data: updatedPost,
			message: 'Cập nhật bài viết thành công',
		});
	},

	'DELETE /api/blog/post': (req: Request, res: Response) => {
		const { id } = req.query as { id?: string };
		posts = posts.filter((item) => item.id !== id);

		res.send({
			success: true,
			message: 'Xóa bài viết thành công',
		});
	},

	'POST /api/blog/post/view': (req: Request, res: Response) => {
		const body = parseBody(req);
		const index = posts.findIndex((item) => item.id === body.id);

		if (index === -1) {
			res.send({
				success: false,
				data: null,
				message: 'Không tìm thấy bài viết',
			});
			return;
		}

		posts[index].viewCount += 1;

		res.send({
			success: true,
			data: posts[index],
		});
	},

	'GET /api/blog/tags': (_req: Request, res: Response) => {
		res.send({
			success: true,
			data: tags,
			total: tags.length,
		});
	},

	'POST /api/blog/tag': (req: Request, res: Response) => {
		const body = parseBody(req);

		const newTag: BlogTag = {
			id: `tag-${Date.now()}`,
			name: body.name,
			color: body.color || 'blue',
			createdAt: new Date().toISOString(),
		};

		tags.unshift(newTag);

		res.send({
			success: true,
			data: newTag,
			message: 'Tạo thẻ thành công',
		});
	},

	'PUT /api/blog/tag': (req: Request, res: Response) => {
		const body = parseBody(req);
		const index = tags.findIndex((item) => item.id === body.id);

		if (index === -1) {
			res.send({
				success: false,
				data: null,
				message: 'Không tìm thấy thẻ',
			});
			return;
		}

		const oldTag = tags[index];
		const oldName = oldTag.name;
		const newName = body.name;

		tags[index] = {
			...oldTag,
			name: newName,
			color: body.color || oldTag.color,
		};

		posts = posts.map((post) => ({
			...post,
			tags: post.tags.map((tag) => (tag === oldName ? newName : tag)),
		}));

		res.send({
			success: true,
			data: tags[index],
			message: 'Cập nhật thẻ thành công',
		});
	},

	'DELETE /api/blog/tag': (req: Request, res: Response) => {
		const { id } = req.query as { id?: string };
		const foundTag = tags.find((item) => item.id === id);

		if (!foundTag) {
			res.send({
				success: false,
				message: 'Không tìm thấy thẻ',
			});
			return;
		}

		tags = tags.filter((item) => item.id !== id);
		posts = posts.map((post) => ({
			...post,
			tags: post.tags.filter((tag) => tag !== foundTag.name),
		}));

		res.send({
			success: true,
			message: 'Xóa thẻ thành công',
		});
	},
};
