import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Modal, Select } from 'antd';
import type { CourseItem, CoursePayload, LecturerItem } from '../data';
import { COURSE_STATUS_OPTIONS } from '../data';

const { TextArea } = Input;
const { Option } = Select;

interface CourseFormProps {
	visible: boolean;
	loading: boolean;
	initialValues: CourseItem | null;
	lecturers: LecturerItem[];
	courses: CourseItem[];
	onCancel: () => void;
	onSubmit: (values: CoursePayload) => Promise<void> | void;
}

const CourseForm: React.FC<CourseFormProps> = ({
	visible,
	loading,
	initialValues,
	lecturers,
	courses,
	onCancel,
	onSubmit,
}) => {
	const [form] = Form.useForm();

	useEffect(() => {
		if (visible) {
			if (initialValues) {
				form.setFieldsValue({
					name: initialValues.name,
					lecturerId: initialValues.lecturerId,
					studentCount: initialValues.studentCount,
					description: initialValues.description,
					status: initialValues.status,
				});
			} else {
				form.resetFields();
				form.setFieldsValue({
					studentCount: 0,
					status: 'DANG_MO',
				});
			}
		}
	}, [visible, initialValues, form]);

	const handleFinish = async (values: CoursePayload) => {
		await onSubmit({
			...values,
			name: values.name.trim(),
			description: values.description.trim(),
		});
	};

	return (
		<Modal
			visible={visible}
			title={initialValues ? 'Chỉnh sửa khóa học' : 'Thêm mới khóa học'}
			onCancel={onCancel}
			onOk={() => form.submit()}
			confirmLoading={loading}
			destroyOnClose
			width={720}
			okText={initialValues ? 'Cập nhật' : 'Thêm mới'}
			cancelText='Hủy'
		>
			<Form form={form} layout='vertical' onFinish={handleFinish}>
				<Form.Item
					label='Tên khóa học'
					name='name'
					rules={[
						{ required: true, message: 'Vui lòng nhập tên khóa học' },
						{ max: 100, message: 'Tên khóa học tối đa 100 ký tự' },
						{
							validator: async (_, value) => {
								const currentName = String(value || '')
									.trim()
									.toLowerCase();
								if (!currentName) {
									return Promise.resolve();
								}

								const isDuplicate = courses.some((item) => {
									const sameName = item.name.trim().toLowerCase() === currentName;
									const isOtherRecord = initialValues ? item.id !== initialValues.id : true;
									return sameName && isOtherRecord;
								});

								if (isDuplicate) {
									return Promise.reject(new Error('Tên khóa học không được trùng'));
								}

								return Promise.resolve();
							},
						},
					]}
				>
					<Input placeholder='Nhập tên khóa học' />
				</Form.Item>

				<Form.Item
					label='Giảng viên'
					name='lecturerId'
					rules={[{ required: true, message: 'Vui lòng chọn giảng viên' }]}
				>
					<Select placeholder='Chọn giảng viên'>
						{lecturers.map((lecturer) => (
							<Option key={lecturer.id} value={lecturer.id}>
								{lecturer.name}
							</Option>
						))}
					</Select>
				</Form.Item>

				<Form.Item
					label='Số lượng học viên'
					name='studentCount'
					rules={[
						{ required: true, message: 'Vui lòng nhập số lượng học viên' },
						{
							validator: async (_, value) => {
								if (value === undefined || value === null || value === '') {
									return Promise.reject(new Error('Vui lòng nhập số lượng học viên'));
								}
								if (Number(value) < 0) {
									return Promise.reject(new Error('Số lượng học viên phải lớn hơn hoặc bằng 0'));
								}
								if (!Number.isInteger(Number(value))) {
									return Promise.reject(new Error('Số lượng học viên phải là số nguyên'));
								}
								return Promise.resolve();
							},
						},
					]}
				>
					<InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder='Nhập số lượng học viên' />
				</Form.Item>

				<Form.Item
					label='Mô tả khóa học (HTML)'
					name='description'
					rules={[{ required: true, message: 'Vui lòng nhập mô tả khóa học' }]}
				>
					<TextArea rows={6} placeholder='Ví dụ: <p>Khóa học React cơ bản</p><ul><li>JSX</li><li>Hooks</li></ul>' />
				</Form.Item>

				<Form.Item
					label='Trạng thái khóa học'
					name='status'
					rules={[{ required: true, message: 'Vui lòng chọn trạng thái khóa học' }]}
				>
					<Select placeholder='Chọn trạng thái'>
						{COURSE_STATUS_OPTIONS.map((item) => (
							<Option key={item.value} value={item.value}>
								{item.label}
							</Option>
						))}
					</Select>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default CourseForm;
