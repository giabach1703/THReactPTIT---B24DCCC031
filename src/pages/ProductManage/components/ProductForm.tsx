import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber } from 'antd';
import type { Product } from '@/models/product';

interface Props {
	open: boolean;
	onCancel: () => void;
	onSubmit: (values: Product) => void;
	initialValues?: Product | null;
}

const ProductForm: React.FC<Props> = ({ open, onCancel, onSubmit, initialValues }) => {
	const [form] = Form.useForm();

	useEffect(() => {
		if (initialValues) {
			form.setFieldsValue(initialValues);
		} else {
			form.resetFields();
		}
	}, [initialValues]);

	return (
		<Modal
			visible={open}
			title={initialValues ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
			onCancel={onCancel}
			onOk={() => form.submit()}
			okText={initialValues ? 'Cập nhật' : 'Thêm'}
			cancelText='Hủy'
		>
			<Form
				form={form}
				layout='vertical'
				onFinish={(values) => {
					onSubmit({
						...values,
						id: initialValues?.id || Date.now(),
					});
				}}
			>
				<Form.Item label='Tên sản phẩm' name='name' rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}>
					<Input />
				</Form.Item>

				<Form.Item
					label='Giá'
					name='price'
					rules={[{ required: true }, { type: 'number', min: 1, message: 'Giá phải là số dương' }]}
				>
					<InputNumber style={{ width: '100%' }} />
				</Form.Item>

				<Form.Item
					label='Số lượng'
					name='quantity'
					rules={[{ required: true }, { type: 'number', min: 1, message: 'Số lượng phải là số nguyên dương' }]}
				>
					<InputNumber style={{ width: '100%' }} />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default ProductForm;
