import React from 'react';
import { Input, Tag, Button, Space } from 'antd';
import type { BlogTag } from '@/services/Blog/typing';

interface Props {
	keyword: string;
	onKeywordChange: (value: string) => void;
	tags: BlogTag[];
	activeTag?: string;
	onTagChange: (tag?: string) => void;
}

const BlogFilter: React.FC<Props> = ({ keyword, onKeywordChange, tags, activeTag, onTagChange }) => {
	return (
		<div
			style={{
				background: '#fff',
				padding: 16,
				borderRadius: 8,
				marginBottom: 16,
			}}
		>
			<Input
				placeholder='Tìm kiếm bài viết...'
				value={keyword}
				onChange={(e) => onKeywordChange(e.target.value)}
				allowClear
				style={{ marginBottom: 16 }}
			/>

			<div>
				<Space wrap>
					<Button type={!activeTag ? 'primary' : 'default'} onClick={() => onTagChange(undefined)}>
						Tất cả
					</Button>

					{tags.map((tag) => (
						<Tag
							key={tag.id}
							color={activeTag === tag.name ? 'processing' : 'default'}
							style={{ padding: '6px 12px', cursor: 'pointer' }}
							onClick={() => onTagChange(tag.name)}
						>
							{tag.name}
						</Tag>
					))}
				</Space>
			</div>
		</div>
	);
};

export default BlogFilter;
