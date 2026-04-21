import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, message, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { createPost, deletePost, getPosts, updatePost } from '@/services/Blog/post';
import { getTags } from '@/services/Blog/tag';
import { formatDateTime } from '@/utils/blog';
import PostForm from './components/PostForm';
import type { BlogPost, BlogTag, PostPayload, PostStatus } from '@/services/Blog/typing';

const AdminPostPage: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [tags, setTags] = useState<BlogTag[]>([]);
	const [keyword, setKeyword] = useState('');
	const [statusFilter, setStatusFilter] = useState<'all' | PostStatus>('all');
	const [visible, setVisible] = useState(false);
	const [editingRecord, setEditingRecord] = useState<BlogPost | null>(null);

	const fetchData = async () => {
		setLoading(true);
		try {
			const [postRes, tagRes] = await Promise.all([getPosts(), getTags()]);
			setPosts(postRes?.data || []);
			setTags(tagRes?.data || []);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const filteredPosts = useMemo(() => {
		let result = [...posts];

		if (statusFilter !== 'all') {
			result = result.filter((item) => item.status === statusFilter);
		}

		if (keyword.trim()) {
			const q = keyword.toLowerCase();
			result = result.filter((item) => item.title.toLowerCase().includes(q));
		}

		return result;
	}, [posts, keyword, statusFilter]);

	const handleCreate = async (values: PostPayload) => {
		await createPost(values);
		message.success('Thêm bài viết thành công');
		setVisible(false);
		setEditingRecord(null);
		fetchData();
	};

	const handleUpdate = async (values: PostPayload) => {
		if (!editingRecord) return;
		await updatePost(editingRecord.id, values);
		message.success('Cập nhật bài viết thành công');
		setVisible(false);
		setEditingRecord(null);
		fetchData();
	};

	const handleDelete = async (id: string) => {
		await deletePost(id);
		message.success('Xóa bài viết thành công');
		fetchData();
	};

	return (
		<PageContainer title='Quản lý bài viết'>
			<div
				style={{
					background: '#fff',
					padding: 16,
					borderRadius: 8,
					marginBottom: 16,
				}}
			>
				<Space wrap>
					<Input
						placeholder='Tìm kiếm theo tiêu đề'
						value={keyword}
						onChange={(e) => setKeyword(e.target.value)}
						style={{ width: 260 }}
						allowClear
					/>

					<Select
						style={{ width: 180 }}
						value={statusFilter}
						onChange={(value) => setStatusFilter(value)}
						options={[
							{ label: 'Tất cả trạng thái', value: 'all' },
							{ label: 'Nháp', value: 'draft' },
							{ label: 'Đã đăng', value: 'published' },
						]}
					/>

					<Button
						type='primary'
						onClick={() => {
							setEditingRecord(null);
							setVisible(true);
						}}
					>
						Thêm bài viết
					</Button>
				</Space>
			</div>

			<Table<BlogPost>
				rowKey='id'
				loading={loading}
				dataSource={filteredPosts}
				pagination={{ pageSize: 8 }}
				columns={[
					{
						title: 'Tiêu đề',
						dataIndex: 'title',
						key: 'title',
					},
					{
						title: 'Trạng thái',
						dataIndex: 'status',
						key: 'status',
						render: (value: PostStatus) =>
							value === 'published' ? <Tag color='green'>Đã đăng</Tag> : <Tag color='orange'>Nháp</Tag>,
					},
					{
						title: 'Thẻ',
						dataIndex: 'tags',
						key: 'tags',
						render: (value: string[]) => (
							<>
								{value.map((item) => (
									<Tag key={item}>{item}</Tag>
								))}
							</>
						),
					},
					{
						title: 'Lượt xem',
						dataIndex: 'viewCount',
						key: 'viewCount',
						width: 100,
					},
					{
						title: 'Ngày tạo',
						dataIndex: 'createdAt',
						key: 'createdAt',
						render: (value: string) => formatDateTime(value),
						width: 120,
					},
					{
						title: 'Thao tác',
						key: 'action',
						width: 180,
						render: (_, record) => (
							<Space>
								<Button
									type='link'
									onClick={() => {
										setEditingRecord(record);
										setVisible(true);
									}}
								>
									Sửa
								</Button>

								<Popconfirm
									title='Bạn có chắc chắn muốn xóa bài viết này?'
									onConfirm={() => handleDelete(record.id)}
									okText='Xóa'
									cancelText='Hủy'
								>
									<Button type='link' danger>
										Xóa
									</Button>
								</Popconfirm>
							</Space>
						),
					},
				]}
			/>

			<PostForm
				visible={visible}
				initialValues={editingRecord}
				tags={tags}
				onCancel={() => {
					setVisible(false);
					setEditingRecord(null);
				}}
				onSubmit={editingRecord ? handleUpdate : handleCreate}
			/>
		</PageContainer>
	);
};

export default AdminPostPage;
