import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Tag, message } from 'antd';
import {
	createId,
	DegreeBook,
	getBooks,
	saveBooks,
	getDegreeRecords,
	getDecisions,
	initializeDemoData,
	getNextEntryNo,
} from '@/utils/degreeStorage';

const SoVanBangPage: React.FC = () => {
	const [form] = Form.useForm();
	const [data, setData] = useState<DegreeBook[]>([]);
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<DegreeBook | null>(null);

	const loadData = () => {
		setData(getBooks().sort((a, b) => b.year - a.year));
	};

	useEffect(() => {
		initializeDemoData();
		loadData();
	}, []);

	const handleOpenAdd = () => {
		setEditing(null);
		form.resetFields();
		form.setFieldsValue({
			year: new Date().getFullYear(),
			description: '',
		});
		setOpen(true);
	};

	const handleOpenEdit = (record: DegreeBook) => {
		setEditing(record);
		form.setFieldsValue(record);
		setOpen(true);
	};

	const handleDelete = (record: DegreeBook) => {
		const degreeCount = getDegreeRecords().filter((item) => item.bookId === record.id).length;
		const decisionCount = getDecisions().filter((item) => item.bookId === record.id).length;

		if (degreeCount > 0 || decisionCount > 0) {
			message.error('Sổ văn bằng đã có quyết định hoặc dữ liệu văn bằng, không thể xóa.');
			return;
		}

		const next = getBooks().filter((item) => item.id !== record.id);
		saveBooks(next);
		message.success('Xóa sổ văn bằng thành công');
		loadData();
	};

	const onFinish = (values: any) => {
		const books = getBooks();

		if (editing) {
			const next = books.map((item) =>
				item.id === editing.id
					? {
							...item,
							year: Number(values.year),
							name: values.name || `Sổ văn bằng năm ${values.year}`,
							description: values.description || '',
					  }
					: item,
			);
			saveBooks(next);
			message.success('Cập nhật sổ văn bằng thành công');
		} else {
			const newItem: DegreeBook = {
				id: createId(),
				year: Number(values.year),
				name: values.name || `Sổ văn bằng năm ${values.year}`,
				description: values.description || '',
				createdAt: new Date().toISOString(),
			};
			saveBooks([...books, newItem]);
			message.success('Thêm sổ văn bằng thành công');
		}

		setOpen(false);
		loadData();
	};

	const columns = [
		{
			title: 'Năm',
			dataIndex: 'year',
			width: 100,
		},
		{
			title: 'Tên sổ văn bằng',
			dataIndex: 'name',
		},
		{
			title: 'Mô tả',
			dataIndex: 'description',
		},
		{
			title: 'Số văn bằng hiện có',
			render: (_: any, record: DegreeBook) => {
				const count = getDegreeRecords().filter((item) => item.bookId === record.id).length;
				return <Tag color='blue'>{count}</Tag>;
			},
		},
		{
			title: 'Số vào sổ tiếp theo',
			render: (_: any, record: DegreeBook) => <Tag color='green'>{getNextEntryNo(record.id)}</Tag>,
		},
		{
			title: 'Thao tác',
			width: 200,
			render: (_: any, record: DegreeBook) => (
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
			title='Quản lý sổ văn bằng'
			extra={
				<Button type='primary' onClick={handleOpenAdd}>
					Thêm sổ văn bằng
				</Button>
			}
		>
			<Table rowKey='id' columns={columns} dataSource={data} pagination={{ pageSize: 8 }} />

			<Modal
				title={editing ? 'Cập nhật sổ văn bằng' : 'Thêm sổ văn bằng'}
				visible={open}
				onCancel={() => setOpen(false)}
				onOk={() => form.submit()}
				destroyOnClose
			>
				<Form form={form} layout='vertical' onFinish={onFinish}>
					<Form.Item
						label='Năm'
						name='year'
						rules={[
							{ required: true, message: 'Vui lòng nhập năm' },
							{ type: 'number', min: 2000, message: 'Năm không hợp lệ' },
						]}
					>
						<InputNumber style={{ width: '100%' }} />
					</Form.Item>

					<Form.Item label='Tên sổ văn bằng' name='name'>
						<Input placeholder='Để trống sẽ tự sinh theo năm' />
					</Form.Item>

					<Form.Item label='Mô tả' name='description'>
						<Input.TextArea rows={3} />
					</Form.Item>
				</Form>
			</Modal>
		</Card>
	);
};

export default SoVanBangPage;
