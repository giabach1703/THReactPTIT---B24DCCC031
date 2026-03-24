import React, { useEffect, useState } from 'react';
import { Button, Card, Descriptions, Empty, Form, Input, Modal, Space, Table, Tag, message } from 'antd';
import {
	DegreeRecord,
	getBooks,
	getDecisionById,
	getDegreeRecords,
	getDecisions,
	increaseDecisionLookup,
	initializeDemoData,
	getAppendixFields,
} from '@/utils/degreeStorage';

const TraCuuVanBangPage: React.FC = () => {
	const [form] = Form.useForm();
	const [results, setResults] = useState<DegreeRecord[]>([]);
	const [detail, setDetail] = useState<DegreeRecord | null>(null);
	const [open, setOpen] = useState(false);

	const reloadResultState = (records: DegreeRecord[]) => {
		setResults(records);
	};

	useEffect(() => {
		initializeDemoData();
	}, []);

	const handleSearch = (values: any) => {
		const filters = {
			degreeNo: values.degreeNo?.trim(),
			entryNo: values.entryNo?.trim(),
			studentId: values.studentId?.trim(),
			fullName: values.fullName?.trim(),
			birthDate: values.birthDate?.trim(),
		};

		const activeCount = Object.values(filters).filter(Boolean).length;

		if (activeCount < 2) {
			message.warning('Bạn phải nhập ít nhất 2 tiêu chí để tra cứu.');
			return;
		}

		const all = getDegreeRecords();

		const matched = all.filter((item) => {
			const cond1 = !filters.degreeNo || item.degreeNo.toLowerCase().includes(filters.degreeNo.toLowerCase());
			const cond2 = !filters.entryNo || String(item.entryNo) === String(filters.entryNo);
			const cond3 = !filters.studentId || item.studentId.toLowerCase().includes(filters.studentId.toLowerCase());
			const cond4 = !filters.fullName || item.fullName.toLowerCase().includes(filters.fullName.toLowerCase());
			const cond5 = !filters.birthDate || item.birthDate === filters.birthDate;

			return cond1 && cond2 && cond3 && cond4 && cond5;
		});

		reloadResultState(matched);

		if (!matched.length) {
			message.info('Không tìm thấy dữ liệu phù hợp');
		}
	};

	const handleViewDetail = (record: DegreeRecord) => {
		setDetail(record);
		setOpen(true);

		if (record.decisionId) {
			increaseDecisionLookup(record.decisionId);
		}
	};

	const appendixFields = getAppendixFields();
	const books = getBooks();
	const decisions = getDecisions();

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
			title: 'Chi tiết',
			width: 120,
			render: (_: any, record: DegreeRecord) => (
				<Button type='link' onClick={() => handleViewDetail(record)}>
					Xem chi tiết
				</Button>
			),
		},
	];

	const selectedDecision = detail ? decisions.find((item) => item.id === detail.decisionId) : undefined;
	const selectedBook = detail ? books.find((item) => item.id === detail.bookId) : undefined;

	return (
		<>
			<Card title='Tra cứu văn bằng'>
				<Form form={form} layout='vertical' onFinish={handleSearch}>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
						<Form.Item label='Số hiệu văn bằng' name='degreeNo'>
							<Input />
						</Form.Item>

						<Form.Item label='Số vào sổ' name='entryNo'>
							<Input />
						</Form.Item>

						<Form.Item label='Mã sinh viên' name='studentId'>
							<Input />
						</Form.Item>

						<Form.Item label='Họ tên' name='fullName'>
							<Input />
						</Form.Item>

						<Form.Item label='Ngày sinh' name='birthDate'>
							<Input type='date' />
						</Form.Item>
					</div>

					<Space>
						<Button type='primary' htmlType='submit'>
							Tra cứu
						</Button>
						<Button
							onClick={() => {
								form.resetFields();
								setResults([]);
							}}
						>
							Làm mới
						</Button>
					</Space>
				</Form>
			</Card>

			<Card title='Kết quả tra cứu' style={{ marginTop: 16 }}>
				{results.length ? (
					<Table rowKey='id' columns={columns} dataSource={results} pagination={{ pageSize: 8 }} />
				) : (
					<Empty description='Chưa có kết quả tra cứu' />
				)}
			</Card>

			<Modal title='Chi tiết văn bằng' visible={open} onCancel={() => setOpen(false)} footer={null} width={900}>
				{detail ? (
					<>
						<Descriptions bordered column={2} size='middle'>
							<Descriptions.Item label='Số vào sổ'>{detail.entryNo}</Descriptions.Item>
							<Descriptions.Item label='Số hiệu văn bằng'>{detail.degreeNo}</Descriptions.Item>
							<Descriptions.Item label='Mã sinh viên'>{detail.studentId}</Descriptions.Item>
							<Descriptions.Item label='Họ tên'>{detail.fullName}</Descriptions.Item>
							<Descriptions.Item label='Ngày sinh'>{detail.birthDate}</Descriptions.Item>
							<Descriptions.Item label='Sổ văn bằng'>{selectedBook?.name || ''}</Descriptions.Item>
							<Descriptions.Item label='Số quyết định'>{selectedDecision?.decisionNo || ''}</Descriptions.Item>
							<Descriptions.Item label='Ngày ban hành'>{selectedDecision?.issuedDate || ''}</Descriptions.Item>
							<Descriptions.Item label='Trích yếu' span={2}>
								{selectedDecision?.summary || ''}
							</Descriptions.Item>
							<Descriptions.Item label='Tổng lượt tra cứu theo quyết định' span={2}>
								<Tag color='purple'>{selectedDecision?.lookupCount || 0}</Tag>
							</Descriptions.Item>

							{appendixFields.map((field) => (
								<Descriptions.Item key={field.id} label={field.name}>
									{detail.extras?.[field.key] ?? ''}
								</Descriptions.Item>
							))}
						</Descriptions>
					</>
				) : null}
			</Modal>
		</>
	);
};

export default TraCuuVanBangPage;
