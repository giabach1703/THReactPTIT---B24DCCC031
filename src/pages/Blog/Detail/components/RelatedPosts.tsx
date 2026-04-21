import React from 'react';
import { List, Tag } from 'antd';
import { history } from 'umi';
import { formatDateTime } from '@/utils/blog';
import type { BlogPost } from '@/services/Blog/typing';

interface Props {
	posts: BlogPost[];
}

const RelatedPosts: React.FC<Props> = ({ posts }) => {
	if (!posts.length) return null;

	return (
		<div
			style={{
				background: '#fff',
				padding: 16,
				borderRadius: 8,
				marginTop: 24,
			}}
		>
			<h3 style={{ marginBottom: 16 }}>Bài viết liên quan</h3>

			<List
				dataSource={posts}
				renderItem={(item) => (
					<List.Item>
						<div style={{ width: '100%' }}>
							<div
								style={{ fontWeight: 600, cursor: 'pointer', marginBottom: 8 }}
								onClick={() => history.push(`/blog/${item.slug}`)}
							>
								{item.title}
							</div>
							<div style={{ color: '#666', marginBottom: 8 }}>{item.summary}</div>
							<div style={{ marginBottom: 8 }}>
								{item.tags.map((tag) => (
									<Tag key={tag}>{tag}</Tag>
								))}
							</div>
							<div style={{ color: '#999', fontSize: 12 }}>{formatDateTime(item.publishedAt || item.createdAt)}</div>
						</div>
					</List.Item>
				)}
			/>
		</div>
	);
};

export default RelatedPosts;
