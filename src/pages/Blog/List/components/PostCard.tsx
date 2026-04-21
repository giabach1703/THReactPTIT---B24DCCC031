import React from 'react';
import { Card, Tag, Avatar, Space } from 'antd';
import { EyeOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { formatDateTime } from '@/utils/blog';
import type { BlogPost } from '@/services/Blog/typing';

interface Props {
	post: BlogPost;
	onTagClick: (tag: string) => void;
}

const PostCard: React.FC<Props> = ({ post, onTagClick }) => {
	return (
		<Card
			hoverable
			cover={
				<img
					alt={post.title}
					src={post.coverImage}
					style={{ height: 220, objectFit: 'cover' }}
					onClick={() => history.push(`/blog/${post.slug}`)}
				/>
			}
			bodyStyle={{ minHeight: 250 }}
		>
			<div
				style={{
					fontSize: 20,
					fontWeight: 600,
					marginBottom: 12,
					cursor: 'pointer',
					lineHeight: 1.5,
				}}
				onClick={() => history.push(`/blog/${post.slug}`)}
			>
				{post.title}
			</div>

			<div style={{ color: '#666', marginBottom: 12, minHeight: 66 }}>{post.summary}</div>

			<Space wrap size={[8, 8]} style={{ marginBottom: 12 }}>
				{post.tags.map((tag) => (
					<Tag key={tag} color='blue' style={{ cursor: 'pointer' }} onClick={() => onTagClick(tag)}>
						{tag}
					</Tag>
				))}
			</Space>

			<div style={{ color: '#888', fontSize: 13 }}>
				<div style={{ marginBottom: 6 }}>
					<CalendarOutlined /> {formatDateTime(post.publishedAt || post.createdAt)}
				</div>
				<div style={{ marginBottom: 6 }}>
					<UserOutlined /> {post.author.name}
				</div>
				<div>
					<EyeOutlined /> {post.viewCount} lượt xem
				</div>
			</div>

			<div style={{ marginTop: 12 }}>
				<Space>
					<Avatar src={post.author.avatar} />
					<span>{post.author.name}</span>
				</Space>
			</div>
		</Card>
	);
};

export default PostCard;
