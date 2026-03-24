import React, { useEffect, useMemo, useState } from 'react';
import {
	Button,
	Card,
	Col,
	Form,
	Input,
	InputNumber,
	Modal,
	Popconfirm,
	Row,
	Select,
	Space,
	Table,
	Tag,
	message,
} from 'antd';
import {
	AppendixField,
	createId,
	DegreeBook,
	DegreeRecord,
	getAppendixFields,
	getBooks,
	getDecisionById,
	getDecisions,
	getDegreeRecords,
	getNextEntryNo,
	GraduationDecision,
	initializeDemoData,
	saveDegreeRecords,
} from '@/utils/degreeStorage';

const ThongTinVanBangPage: React.FC = () => {
	const [form] = Form.useForm();
	const [books, setBooks] = useState<DegreeBook[]>([]);
	const [decisions, setDecisions] = useState<GraduationDecision[]>([]);
	const [fields, setFields] = useState<AppendixField[]>([]);
	const [data, setData] = useState<DegreeRecord[]>([]);
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<DegreeRecord | null>(null);

	const loadData = () => {
		setBooks(getBooks());
		setDecisions(getDecisions());
		setFields(getAppendixFields());
		setData(getDegreeRecords());
	};

	useEffect(() => {
		initializeDemoData();
		loadData();
	}, []);

	const selectedBookId = Form.useWatch('bookId', form);

	const decisionOptions = useMemo(() => {
		if (!selectedBookId) return decisions;
		return decisions.filter((item) => item.bookId === selectedBookId);
	}, [selectedBookId, decisions]);

	const fillNextEntryNo = (bookId: string) => {
		if (!bookId || editing) return;
		const nextEntryNo = getNextEntryNo(bookId);
		form.setFieldsValue({ entryNo: nextEntryNo });
	};

	const handleOpenAdd = () => {
		if (!books.length) {
			message.warning('Bạn cần tạo sổ văn bằng trước.');
			return;
		}
		if (!decisions.length) {
			message.warning('Bạn cần tạo quyết định tốt nghiệp trước.');
			return;
		}

		setEditing(null);
		form.resetFields();

		const firstBookId = books[0]?.id;
		form.setFieldsValue({
			bookId: firstBookId,
			decisionId: decisions.find((item) => item.bookId === firstBookId)?.id,
			entryNo: firstBookId ? getNextEntryNo(firstBookId) : 1,
		});
		setOpen(true);
	};

	const handleOpenEdit = (record: DegreeRecord) => {
		setEditing(record);
		const extraValues: Record<string, any> = {};
		fields.forEach((field) => {
			extraValues[field.key] = record.extras?.[field.key];
		});

		form.setFieldsValue({
			...record,
			...extraValues,
		});
		setOpen(true);
	};

	const handleDelete = (record: DegreeRecord) => {
		const next = getDegreeRecords().filter((item) => item.id !== record.id);
		saveDegreeRecords(next);
		message.success('Xóa thông tin văn bằng thành công');
		loadData();
	};

	const onFinish = (values: any) => {
		const records = getDegreeRecords();
		const extras: Record<string, any> = {};

		fields.forEach((field) => {
			extras[field.key] = values[field.key];
		});

		if (editing) {
			const next = records.map((item) =>
				item.id === editing.id
					? {
							...item,
							degreeNo: values.degreeNo,
							studentId: values.studentId,
							fullName: values.fullName,
							birthDate: values.birthDate,
							decisionId: values.decisionId,
							extras,
					  }
					: item,
			);
			saveDegreeRecords(next);
			message.success('Cập nhật văn bằng thành công');
		} else {
			const newItem: DegreeRecord = {
				id: createId(),
				bookId: values.bookId,
				decisionId: values.decisionId,
				entryNo: Number(values.entryNo),
				degreeNo: values.degreeNo,
				studentId: values.studentId,
				fullName: values.fullName,
				birthDate: values.birthDate,
				extras,
				createdAt: new Date().toISOString(),
			};
			saveDegreeRecords([...records, newItem]);
			message.success('Thêm văn bằng thành công');
		}

		setOpen(false);
		loadData();
	};

	const columns = [
		{
			title: 'Số vào sổ',
			dataIndex: 'entryNo',
			width: 100,
			render: (value: number) => <Tag color='green'>{value}</Tag>,
		},
		{
			title: 'Số hiệu văn bằng',
			dataIndex: 'degreeNo',
			width: 150,
		},
		{
			title: 'Mã sinh viên',
			dataIndex: 'studentId',
			width: 140,
		},
		{
			title: 'Họ tên',
			dataIndex: 'fullName',
			width: 180,
		},
		{
			title: 'Ngày sinh',
			dataIndex: 'birthDate',
			width: 120,
		},
		{
			title: 'Quyết định',
			render: (_: any, record: DegreeRecord) => getDecisionById(record.decisionId)?.decisionNo || '',
			width: 140,
		},
		{
			title: 'Sổ văn bằng',
			render: (_: any, record: DegreeRecord) => books.find((item) => item.id === record.bookId)?.name || '',
		},
		{
			title: 'Thao tác',
			width: 180,
			render: (_: any, record: DegreeRecord) => (
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
			title='Thông tin văn bằng'
			extra={
				<Button type='primary' onClick={handleOpenAdd}>
					Thêm thông tin văn bằng
				</Button>
			}
		>
			<Table rowKey='id' columns={columns} dataSource={data} pagination={{ pageSize: 8 }} />

			<Modal
				title={editing ? 'Cập nhật thông tin văn bằng' : 'Thêm thông tin văn bằng'}
				visible={open}
				onCancel={() => setOpen(false)}
				onOk={() => form.submit()}
				width={900}
				destroyOnClose
			>
				<Form
					form={form}
					layout='vertical'
					onFinish={onFinish}
					onValuesChange={(changedValues) => {
						if (!editing && changedValues.bookId) {
							fillNextEntryNo(changedValues.bookId);
							const matchedDecision = decisions.find((item) => item.bookId === changedValues.bookId);
							form.setFieldsValue({
								decisionId: matchedDecision?.id,
							});
						}
					}}
				>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item
								label='Sổ văn bằng'
								name='bookId'
								rules={[{ required: true, message: 'Vui lòng chọn sổ văn bằng' }]}
							>
								<Select
									disabled={!!editing}
									options={books.map((item) => ({
										label: `${item.name} (${item.year})`,
										value: item.id,
									}))}
								/>
							</Form.Item>
						</Col>

						<Col span={12}>
							<Form.Item
								label='Quyết định tốt nghiệp'
								name='decisionId'
								rules={[{ required: true, message: 'Vui lòng chọn quyết định tốt nghiệp' }]}
							>
								<Select
									options={decisionOptions.map((item) => ({
										label: `${item.decisionNo} - ${item.summary}`,
										value: item.id,
									}))}
								/>
							</Form.Item>
						</Col>

						<Col span={8}>
							<Form.Item label='Số vào sổ' name='entryNo' rules={[{ required: true, message: 'Thiếu số vào sổ' }]}>
								<InputNumber style={{ width: '100%' }} disabled />
							</Form.Item>
						</Col>

						<Col span={8}>
							<Form.Item
								label='Số hiệu văn bằng'
								name='degreeNo'
								rules={[{ required: true, message: 'Vui lòng nhập số hiệu văn bằng' }]}
							>
								<Input />
							</Form.Item>
						</Col>

						<Col span={8}>
							<Form.Item
								label='Mã sinh viên'
								name='studentId'
								rules={[{ required: true, message: 'Vui lòng nhập mã sinh viên' }]}
							>
								<Input />
							</Form.Item>
						</Col>

						<Col span={12}>
							<Form.Item label='Họ tên' name='fullName' rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
								<Input />
							</Form.Item>
						</Col>

						<Col span={12}>
							<Form.Item
								label='Ngày sinh'
								name='birthDate'
								rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
							>
								<Input type='date' />
							</Form.Item>
						</Col>

						{fields.map((field) => (
							<Col span={12} key={field.id}>
								{field.dataType === 'string' && (
									<Form.Item label={field.name} name={field.key}>
										<Input />
									</Form.Item>
								)}

								{field.dataType === 'number' && (
									<Form.Item label={field.name} name={field.key}>
										<InputNumber style={{ width: '100%' }} />
									</Form.Item>
								)}

								{field.dataType === 'date' && (
									<Form.Item label={field.name} name={field.key}>
										<Input type='date' />
									</Form.Item>
								)}
							</Col>
						))}
					</Row>
				</Form>
			</Modal>
		</Card>
	);
};

export default ThongTinVanBangPage;
