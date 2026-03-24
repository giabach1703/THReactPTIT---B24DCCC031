import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, message } from 'antd';
import {
	AppendixField,
	createId,
	getAppendixFields,
	saveAppendixFields,
	normalizeFieldKey,
	getDegreeRecords,
	initializeDemoData,
} from '@/utils/degreeStorage';

const CauHinhPhuLucPage: React.FC = () => {
	const [form] = Form.useForm();
	const [data, setData] = useState<AppendixField[]>([]);
	const [open, setOpen] = useState<boolean>(false);
	const [editing, setEditing] = useState<AppendixField | null>(null);

	const loadData = () => {
		const fields = getAppendixFields();
		setData(fields);
	};

	useEffect(() => {
		initializeDemoData();
		loadData();
	}, []);

	const handleOpenAdd = () => {
		setEditing(null);
		form.resetFields();
		form.setFieldsValue({
			dataType: 'string',
		});
		setOpen(true);
	};

	const handleOpenEdit = (record: AppendixField) => {
		setEditing(record);
		form.setFieldsValue({
			name: record.name,
			dataType: record.dataType,
		});
		setOpen(true);
	};

	const handleDelete = (record: AppendixField) => {
		const records = getDegreeRecords();
		const isUsed = records.some((degree) => {
			return degree.extras && degree.extras[record.key] !== undefined;
		});

		if (isUsed) {
			message.error('Trường thông tin này đã có dữ liệu trong văn bằng, không thể xóa.');
			return;
		}

		const next = getAppendixFields().filter((item) => item.id !== record.id);
		saveAppendixFields(next);
		message.success('Xóa trường thông tin thành công');
		loadData();
	};

	const onFinish = (values: any) => {
		const fields = getAppendixFields();

		if (editing) {
			const next = fields.map((item) => {
				if (item.id === editing.id) {
					return {
						...item,
						name: values.name,
						dataType: values.dataType,
					};
				}
				return item;
			});

			saveAppendixFields(next);
			message.success('Cập nhật trường thông tin thành công');
		} else {
			const rawKey = normalizeFieldKey(values.name);
			const baseKey = rawKey || 'truong_moi';
			let finalKey = baseKey;
			let index = 1;

			while (true) {
				const currentKey = finalKey;
				if (!fields.some((item) => item.key === currentKey)) break;
				finalKey = `${baseKey}_${index}`;
				index += 1;
			}
			const newItem: AppendixField = {
				id: createId(),
				name: values.name,
				key: finalKey,
				dataType: values.dataType,
				createdAt: new Date().toISOString(),
			};

			saveAppendixFields([...fields, newItem]);
			message.success('Thêm trường thông tin thành công');
		}

		setOpen(false);
		form.resetFields();
		loadData();
	};

	const columns = [
		{
			title: 'Tên trường',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Mã trường',
			dataIndex: 'key',
			key: 'key',
			width: 180,
			render: (value: string) => <Tag>{value}</Tag>,
		},
		{
			title: 'Kiểu dữ liệu',
			dataIndex: 'dataType',
			key: 'dataType',
			width: 150,
			render: (value: string) => {
				if (value === 'string') return <Tag color='blue'>String</Tag>;
				if (value === 'number') return <Tag color='green'>Number</Tag>;
				if (value === 'date') return <Tag color='orange'>Date</Tag>;
				return <Tag>{value}</Tag>;
			},
		},
		{
			title: 'Thao tác',
			key: 'action',
			width: 180,
			render: (_: any, record: AppendixField) => (
				<Space>
					<Button type='link' onClick={() => handleOpenEdit(record)}>
						Sửa
					</Button>
					<Popconfirm title='Bạn chắc chắn muốn xóa?' onConfirm={() => handleDelete(record)}>
						<Button type='link' danger>
							Xóa
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<Card
			title='Cấu hình biểu mẫu phụ lục văn bằng'
			extra={
				<Button type='primary' onClick={handleOpenAdd}>
					Thêm trường thông tin
				</Button>
			}
		>
			<Table rowKey='id' columns={columns} dataSource={data} pagination={{ pageSize: 8 }} />

			<Modal
				title={editing ? 'Cập nhật trường thông tin' : 'Thêm trường thông tin'}
				visible={open}
				onCancel={() => setOpen(false)}
				onOk={() => form.submit()}
				destroyOnClose
			>
				<Form form={form} layout='vertical' onFinish={onFinish}>
					<Form.Item label='Tên trường' name='name' rules={[{ required: true, message: 'Vui lòng nhập tên trường' }]}>
						<Input placeholder='Ví dụ: Dân tộc, Nơi sinh, Điểm trung bình...' />
					</Form.Item>

					<Form.Item
						label='Kiểu dữ liệu'
						name='dataType'
						rules={[{ required: true, message: 'Vui lòng chọn kiểu dữ liệu' }]}
					>
						<Select>
							<Select.Option value='string'>String</Select.Option>
							<Select.Option value='number'>Number</Select.Option>
							<Select.Option value='date'>Date</Select.Option>
						</Select>
					</Form.Item>

					{editing ? (
						<Form.Item label='Mã trường'>
							<Input value={editing.key} disabled />
						</Form.Item>
					) : null}
				</Form>
			</Modal>
		</Card>
	);
};

export default CauHinhPhuLucPage;
