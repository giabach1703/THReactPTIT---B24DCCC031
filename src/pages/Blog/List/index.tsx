import React, { useEffect, useMemo, useState } from 'react';
import { Row, Col, Pagination, Empty, Spin } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import BlogFilter from './components/BlogFilter';
import PostCard from './components/PostCard';
import { getPosts } from '@/services/Blog/post';
import { getTags } from '@/services/Blog/tag';
import type { BlogPost, BlogTag } from '@/services/Blog/typing';

const PAGE_SIZE = 9;

const BlogListPage: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [tags, setTags] = useState<BlogTag[]>([]);
	const [keyword, setKeyword] = useState('');
	const [debouncedKeyword, setDebouncedKeyword] = useState('');
	const [activeTag, setActiveTag] = useState<string | undefined>();
	const [currentPage, setCurrentPage] = useState(1);

	const fetchData = async () => {
		setLoading(true);
		try {
			const [postRes, tagRes] = await Promise.all([getPosts({ status: 'published' }), getTags()]);
			setPosts(postRes?.data || []);
			setTags(tagRes?.data || []);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedKeyword(keyword.trim());
			setCurrentPage(1);
		}, 300);

		return () => clearTimeout(timer);
	}, [keyword]);

	const filteredPosts = useMemo(() => {
		let result = [...posts];

		if (activeTag) {
			result = result.filter((item) => item.tags.includes(activeTag));
		}

		if (debouncedKeyword) {
			const q = debouncedKeyword.toLowerCase();
			result = result.filter(
				(item) =>
					item.title.toLowerCase().includes(q) ||
					item.summary.toLowerCase().includes(q) ||
					item.content.toLowerCase().includes(q),
			);
		}

		return result;
	}, [posts, activeTag, debouncedKeyword]);

	const pagedPosts = useMemo(() => {
		const start = (currentPage - 1) * PAGE_SIZE;
		return filteredPosts.slice(start, start + PAGE_SIZE);
	}, [filteredPosts, currentPage]);

	return (
		<PageContainer title='Blog cá nhân'>
			<BlogFilter
				keyword={keyword}
				onKeywordChange={setKeyword}
				tags={tags}
				activeTag={activeTag}
				onTagChange={(tag) => {
					setActiveTag(tag);
					setCurrentPage(1);
				}}
			/>

			<Spin spinning={loading}>
				{pagedPosts.length === 0 ? (
					<Empty description='Không có bài viết phù hợp' />
				) : (
					<>
						<Row gutter={[16, 16]}>
							{pagedPosts.map((post) => (
								<Col xs={24} sm={12} lg={8} key={post.id}>
									<PostCard
										post={post}
										onTagClick={(tag) => {
											setActiveTag(tag);
											setCurrentPage(1);
										}}
									/>
								</Col>
							))}
						</Row>

						<div style={{ marginTop: 24, textAlign: 'right' }}>
							<Pagination
								current={currentPage}
								pageSize={PAGE_SIZE}
								total={filteredPosts.length}
								onChange={setCurrentPage}
								showSizeChanger={false}
							/>
						</div>
					</>
				)}
			</Spin>
		</PageContainer>
	);
};

export default BlogListPage;
