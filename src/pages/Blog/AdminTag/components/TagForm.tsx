import React, { useEffect } from 'react';
import { Form, Input, Modal, Select } from 'antd';
import type { BlogTag } from '@/services/Blog/typing';

interface Props {
	visible: boolean;
	initialValues?: BlogTag | null;
	onCancel: () => void;
	onSubmit: (values: Pick<BlogTag, 'name' | 'color'>) => Promise<void>;
}

const colorOptions = [
	'blue',
	'cyan',
	'geekblue',
	'gold',
	'green',
	'lime',
	'magenta',
	'orange',
	'purple',
	'red',
	'volcano',
];

const TagForm: React.FC<Props> = ({ visible, initialValues, onCancel, onSubmit }) => {
	const [form] = Form.useForm();

	useEffect(() => {
		if (visible) {
			if (initialValues) {
				form.setFieldsValue({
					name: initialValues.name,
					color: initialValues.color || 'blue',
				});
			} else {
				form.resetFields();
				form.setFieldsValue({ color: 'blue' });
			}
		}
	}, [visible, initialValues, form]);

	const handleOk = async () => {
		const values = await form.validateFields();
		await onSubmit(values);
		form.resetFields();
	};

	return (
		<Modal
			visible={visible}
			title={initialValues ? 'Cập nhật thẻ' : 'Thêm thẻ'}
			onCancel={onCancel}
			onOk={handleOk}
			destroyOnClose
		>
			<Form form={form} layout='vertical'>
				<Form.Item name='name' label='Tên thẻ' rules={[{ required: true, message: 'Vui lòng nhập tên thẻ' }]}>
					<Input placeholder='Nhập tên thẻ' />
				</Form.Item>

				<Form.Item name='color' label='Màu sắc' rules={[{ required: true, message: 'Vui lòng chọn màu' }]}>
					<Select
						options={colorOptions.map((item) => ({
							label: item,
							value: item,
						}))}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default TagForm;
