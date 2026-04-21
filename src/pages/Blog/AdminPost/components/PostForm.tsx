import React, { useEffect } from 'react';
import { Form, Input, Modal, Select } from 'antd';
import { generateSlug, getExcerpt } from '@/utils/blog';
import type { BlogPost, BlogTag, PostPayload } from '@/services/Blog/typing';

interface Props {
	visible: boolean;
	initialValues?: BlogPost | null;
	tags: BlogTag[];
	onCancel: () => void;
	onSubmit: (values: PostPayload) => Promise<void>;
}

const PostForm: React.FC<Props> = ({ visible, initialValues, tags, onCancel, onSubmit }) => {
	const [form] = Form.useForm();

	useEffect(() => {
		if (visible) {
			if (initialValues) {
				form.setFieldsValue({
					title: initialValues.title,
					slug: initialValues.slug,
					summary: initialValues.summary,
					content: initialValues.content,
					coverImage: initialValues.coverImage,
					tags: initialValues.tags,
					status: initialValues.status,
				});
			} else {
				form.resetFields();
				form.setFieldsValue({
					status: 'draft',
					tags: [],
				});
			}
		}
	}, [visible, initialValues, form]);

	const handleOk = async () => {
		const values = await form.validateFields();
		const payload: PostPayload = {
			...values,
			summary: values.summary || getExcerpt(values.content, 160),
		};
		await onSubmit(payload);
		form.resetFields();
	};

	return (
		<Modal
			visible={visible}
			title={initialValues ? 'Cập nhật bài viết' : 'Thêm bài viết'}
			onCancel={onCancel}
			onOk={handleOk}
			width={900}
			destroyOnClose
		>
			<Form form={form} layout='vertical'>
				<Form.Item name='title' label='Tiêu đề' rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
					<Input
						placeholder='Nhập tiêu đề'
						onBlur={() => {
							const title = form.getFieldValue('title');
							const slug = form.getFieldValue('slug');
							if (title && !slug) {
								form.setFieldsValue({ slug: generateSlug(title) });
							}
						}}
					/>
				</Form.Item>

				<Form.Item name='slug' label='Slug' rules={[{ required: true, message: 'Vui lòng nhập slug' }]}>
					<Input placeholder='vd: huong-dan-reactjs' />
				</Form.Item>

				<Form.Item name='summary' label='Tóm tắt'>
					<Input.TextArea rows={3} placeholder='Nếu bỏ trống, hệ thống sẽ tự sinh từ nội dung' />
				</Form.Item>

				<Form.Item
					name='content'
					label='Nội dung (Markdown)'
					rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
				>
					<Input.TextArea rows={12} placeholder='Nhập nội dung markdown...' />
				</Form.Item>

				<Form.Item
					name='coverImage'
					label='Ảnh đại diện (URL)'
					rules={[{ required: true, message: 'Vui lòng nhập URL ảnh' }]}
				>
					<Input placeholder='https://...' />
				</Form.Item>

				<Form.Item name='tags' label='Thẻ' rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 thẻ' }]}>
					<Select
						mode='multiple'
						placeholder='Chọn thẻ'
						options={tags.map((tag) => ({
							label: tag.name,
							value: tag.name,
						}))}
					/>
				</Form.Item>

				<Form.Item name='status' label='Trạng thái' rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
					<Select
						options={[
							{ label: 'Nháp', value: 'draft' },
							{ label: 'Đã đăng', value: 'published' },
						]}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default PostForm;
