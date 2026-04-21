import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Empty, Space, Spin, Tag } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { history } from 'umi';
import { getPostBySlug, getPosts, increaseViewCount } from '@/services/Blog/post';
import { formatDateTime, getRelatedPosts, renderMarkdownToHtml } from '@/utils/blog';
import RelatedPosts from './components/RelatedPosts';
import type { BlogPost } from '@/services/Blog/typing';

interface Props {
	match: {
		params: {
			slug: string;
		};
	};
}

const BlogDetailPage: React.FC<Props> = ({ match }) => {
	const slug = match?.params?.slug;
	const [loading, setLoading] = useState(false);
	const [post, setPost] = useState<BlogPost | null>(null);
	const [allPosts, setAllPosts] = useState<BlogPost[]>([]);

	const fetchData = async () => {
		setLoading(true);
		try {
			const [detailRes, postRes] = await Promise.all([getPostBySlug(slug), getPosts({ status: 'published' })]);

			const detailPost = detailRes?.data || null;
			setPost(detailPost);
			setAllPosts(postRes?.data || []);

			if (detailPost?.id) {
				const viewRes = await increaseViewCount(detailPost.id);
				if (viewRes?.data) {
					setPost(viewRes.data);
				}
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [slug]);

	const relatedPosts = useMemo(() => {
		if (!post) return [];
		return getRelatedPosts(post, allPosts, 3);
	}, [post, allPosts]);

	return (
		<PageContainer title='Chi tiết bài viết'>
			<Spin spinning={loading}>
				{!post ? (
					<Empty description='Không tìm thấy bài viết' />
				) : (
					<>
						<div
							style={{
								background: '#fff',
								padding: 24,
								borderRadius: 8,
							}}
						>
							<Button icon={<ArrowLeftOutlined />} onClick={() => history.push('/blog/home')}>
								Quay lại danh sách
							</Button>

							<div style={{ marginTop: 20 }}>
								<img
									src={post.coverImage}
									alt={post.title}
									style={{
										width: '100%',
										maxHeight: 420,
										objectFit: 'cover',
										borderRadius: 8,
										marginBottom: 20,
									}}
								/>

								<h1 style={{ marginBottom: 16 }}>{post.title}</h1>

								<Space wrap size={[16, 8]} style={{ marginBottom: 16, color: '#666' }}>
									<span>
										<CalendarOutlined /> {formatDateTime(post.publishedAt || post.createdAt)}
									</span>
									<span>
										<UserOutlined /> {post.author.name}
									</span>
									<span>
										<EyeOutlined /> {post.viewCount} lượt xem
									</span>
								</Space>

								<div style={{ marginBottom: 20 }}>
									{post.tags.map((tag) => (
										<Tag key={tag} color='blue'>
											{tag}
										</Tag>
									))}
								</div>

								<div
									style={{
										background: '#fafafa',
										borderRadius: 8,
										padding: 16,
										marginBottom: 24,
									}}
								>
									<Space align='start'>
										<Avatar src={post.author.avatar} size={64} />
										<div>
											<div style={{ fontWeight: 600, fontSize: 16 }}>{post.author.name}</div>
											<div style={{ color: '#666' }}>{post.author.bio}</div>
										</div>
									</Space>
								</div>

								<div
									className='blog-markdown-content'
									dangerouslySetInnerHTML={{
										__html: renderMarkdownToHtml(post.content),
									}}
								/>
							</div>
						</div>

						<RelatedPosts posts={relatedPosts} />
					</>
				)}
			</Spin>
		</PageContainer>
	);
};

export default BlogDetailPage;
