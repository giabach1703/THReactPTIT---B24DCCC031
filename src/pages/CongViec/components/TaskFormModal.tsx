import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select } from 'antd';
import moment from 'moment';
import type { TaskItem } from '@/types/task';

const { TextArea } = Input;
const { Option } = Select;

interface TaskFormModalProps {
	visible: boolean;
	editingTask?: TaskItem | null;
	onCancel: () => void;
	onSubmit: (values: any) => void;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ visible, editingTask, onCancel, onSubmit }) => {
	const [form] = Form.useForm();

	useEffect(() => {
		if (visible && editingTask) {
			form.setFieldsValue({
				...editingTask,
				deadline: editingTask.deadline ? moment(editingTask.deadline, 'YYYY-MM-DD') : undefined,
			});
		}

		if (visible && !editingTask) {
			form.resetFields();
			form.setFieldsValue({
				status: 'todo',
				priority: 'medium',
			});
		}
	}, [visible, editingTask, form]);

	const handleOk = () => {
		form.validateFields().then((values) => {
			onSubmit({
				...values,
				deadline: values.deadline.format('YYYY-MM-DD'),
			});
			form.resetFields();
		});
	};

	return (
		<Modal
			title={editingTask ? 'Chỉnh sửa task' : 'Thêm task mới'}
			visible={visible}
			onOk={handleOk}
			onCancel={() => {
				form.resetFields();
				onCancel();
			}}
			okText={editingTask ? 'Cập nhật' : 'Thêm mới'}
			cancelText='Hủy'
			destroyOnClose
			width={720}
		>
			<Form form={form} layout='vertical'>
				<Form.Item label='Tên task' name='name' rules={[{ required: true, message: 'Vui lòng nhập tên task' }]}>
					<Input placeholder='Nhập tên task' />
				</Form.Item>

				<Form.Item label='Mô tả' name='description'>
					<TextArea rows={3} placeholder='Nhập mô tả công việc' />
				</Form.Item>

				<Form.Item label='Deadline' name='deadline' rules={[{ required: true, message: 'Vui lòng chọn deadline' }]}>
					<DatePicker style={{ width: '100%' }} format='DD/MM/YYYY' />
				</Form.Item>

				<Form.Item
					label='Mức độ ưu tiên'
					name='priority'
					rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên' }]}
				>
					<Select placeholder='Chọn mức độ ưu tiên'>
						<Option value='high'>Cao</Option>
						<Option value='medium'>Trung bình</Option>
						<Option value='low'>Thấp</Option>
					</Select>
				</Form.Item>

				<Form.Item label='Tag' name='tag'>
					<Input placeholder='Ví dụ: Học tập, Công việc, Cá nhân...' />
				</Form.Item>

				<Form.Item label='Trạng thái' name='status' rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
					<Select placeholder='Chọn trạng thái'>
						<Option value='todo'>Cần làm</Option>
						<Option value='doing'>Đang làm</Option>
						<Option value='done'>Hoàn thành</Option>
					</Select>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default TaskFormModal;
