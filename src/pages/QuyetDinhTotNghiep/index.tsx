import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, message } from 'antd';
import {
	createId,
	DegreeBook,
	GraduationDecision,
	getBooks,
	getDecisions,
	saveDecisions,
	getDegreeRecords,
	initializeDemoData,
} from '@/utils/degreeStorage';

const QuyetDinhTotNghiepPage: React.FC = () => {
	const [form] = Form.useForm();
	const [books, setBooks] = useState<DegreeBook[]>([]);
	const [data, setData] = useState<GraduationDecision[]>([]);
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<GraduationDecision | null>(null);

	const loadData = () => {
		setBooks(getBooks());
		setData(getDecisions());
	};

	useEffect(() => {
		initializeDemoData();
		loadData();
	}, []);

	const handleOpenAdd = () => {
		if (!getBooks().length) {
			message.warning('Bạn cần tạo sổ văn bằng trước.');
			return;
		}
		setEditing(null);
		form.resetFields();
		form.setFieldsValue({
			issuedDate: new Date().toISOString().slice(0, 10),
		});
		setOpen(true);
	};

	const handleOpenEdit = (record: GraduationDecision) => {
		setEditing(record);
		form.setFieldsValue(record);
		setOpen(true);
	};

	const handleDelete = (record: GraduationDecision) => {
		const degreeCount = getDegreeRecords().filter((item) => item.decisionId === record.id).length;
		if (degreeCount > 0) {
			message.error('Quyết định đã được gắn với thông tin văn bằng, không thể xóa.');
			return;
		}

		const next = getDecisions().filter((item) => item.id !== record.id);
		saveDecisions(next);
		message.success('Xóa quyết định thành công');
		loadData();
	};

	const onFinish = (values: any) => {
		const decisions = getDecisions();

		if (editing) {
			const next = decisions.map((item) =>
				item.id === editing.id
					? {
							...item,
							decisionNo: values.decisionNo,
							issuedDate: values.issuedDate,
							summary: values.summary,
							bookId: values.bookId,
					  }
					: item,
			);
			saveDecisions(next);
			message.success('Cập nhật quyết định thành công');
		} else {
			const newItem: GraduationDecision = {
				id: createId(),
				decisionNo: values.decisionNo,
				issuedDate: values.issuedDate,
				summary: values.summary,
				bookId: values.bookId,
				lookupCount: 0,
				createdAt: new Date().toISOString(),
			};
			saveDecisions([...decisions, newItem]);
			message.success('Thêm quyết định thành công');
		}

		setOpen(false);
		loadData();
	};

	const columns = [
		{
			title: 'Số quyết định',
			dataIndex: 'decisionNo',
			width: 160,
		},
		{
			title: 'Ngày ban hành',
			dataIndex: 'issuedDate',
			width: 140,
		},
		{
			title: 'Trích yếu',
			dataIndex: 'summary',
		},
		{
			title: 'Sổ văn bằng',
			render: (_: any, record: GraduationDecision) => {
				const book = books.find((item) => item.id === record.bookId);
				return book?.name || '';
			},
		},
		{
			title: 'Lượt tra cứu',
			dataIndex: 'lookupCount',
			render: (value: number) => <Tag color='purple'>{value || 0}</Tag>,
		},
		{
			title: 'Thao tác',
			width: 180,
			render: (_: any, record: GraduationDecision) => (
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
			title='Quyết định tốt nghiệp'
			extra={
				<Button type='primary' onClick={handleOpenAdd}>
					Thêm quyết định
				</Button>
			}
		>
			<Table rowKey='id' columns={columns} dataSource={data} pagination={{ pageSize: 8 }} />

			<Modal
				title={editing ? 'Cập nhật quyết định' : 'Thêm quyết định'}
				visible={open}
				onCancel={() => setOpen(false)}
				onOk={() => form.submit()}
				destroyOnClose
			>
				<Form form={form} layout='vertical' onFinish={onFinish}>
					<Form.Item
						label='Số quyết định'
						name='decisionNo'
						rules={[{ required: true, message: 'Vui lòng nhập số quyết định' }]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						label='Ngày ban hành'
						name='issuedDate'
						rules={[{ required: true, message: 'Vui lòng chọn ngày ban hành' }]}
					>
						<Input type='date' />
					</Form.Item>

					<Form.Item label='Trích yếu' name='summary' rules={[{ required: true, message: 'Vui lòng nhập trích yếu' }]}>
						<Input.TextArea rows={3} />
					</Form.Item>

					<Form.Item
						label='Thuộc sổ văn bằng'
						name='bookId'
						rules={[{ required: true, message: 'Vui lòng chọn sổ văn bằng' }]}
					>
						<Select
							options={books.map((item) => ({
								label: `${item.name} (${item.year})`,
								value: item.id,
							}))}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</Card>
	);
};

export default QuyetDinhTotNghiepPage;
