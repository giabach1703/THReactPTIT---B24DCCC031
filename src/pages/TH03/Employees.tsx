import React, { useEffect, useState } from 'react';
import {
	Button,
	Card,
	Col,
	Divider,
	Form,
	Input,
	InputNumber,
	Modal,
	Row,
	Select,
	Space,
	Statistic,
	Table,
	Tag,
	Typography,
	message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, StarOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import {
	Employee,
	deleteEmployee,
	getAverageRatingByEmployee,
	getEmployees,
	getSummaryStats,
	getWeekdayLabel,
	initStore,
	saveEmployee,
} from '@/utils/appointmentStore';

const { Title, Text } = Typography;

const weekOptions = [
	{ label: 'CN', value: 0 },
	{ label: 'T2', value: 1 },
	{ label: 'T3', value: 2 },
	{ label: 'T4', value: 3 },
	{ label: 'T5', value: 4 },
	{ label: 'T6', value: 5 },
	{ label: 'T7', value: 6 },
];

const cardStyle: React.CSSProperties = {
	borderRadius: 16,
	boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
};

const EmployeesPage: React.FC = () => {
	const [list, setList] = useState<Employee[]>([]);
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<Employee | null>(null);
	const [form] = Form.useForm();

	const loadData = () => {
		initStore();
		setList(getEmployees());
	};

	useEffect(() => {
		loadData();
	}, []);

	const summary = getSummaryStats();

	const handleOpenCreate = () => {
		setEditing(null);
		form.resetFields();
		form.setFieldsValue({
			workDays: [1, 2, 3, 4, 5, 6],
			startTime: '09:00',
			endTime: '17:00',
			maxCustomersPerDay: 8,
		});
		setOpen(true);
	};

	const handleEdit = (record: Employee) => {
		setEditing(record);
		form.setFieldsValue(record);
		setOpen(true);
	};

	const handleSubmit = async () => {
		const values = await form.validateFields();
		saveEmployee({ ...editing, ...values });
		message.success(editing ? 'Cập nhật nhân viên thành công' : 'Thêm nhân viên thành công');
		setOpen(false);
		setEditing(null);
		form.resetFields();
		loadData();
	};

	const columns = [
		{
			title: 'Nhân viên',
			render: (_: any, record: Employee) => (
				<div>
					<Text strong>{record.name}</Text>
					<div style={{ color: '#667085' }}>{record.specialty}</div>
				</div>
			),
		},
		{
			title: 'Điện thoại',
			dataIndex: 'phone',
		},
		{
			title: 'Giới hạn/ngày',
			dataIndex: 'maxCustomersPerDay',
			align: 'center' as const,
		},
		{
			title: 'Lịch làm việc',
			render: (_: any, record: Employee) => (
				<div>
					<div style={{ marginBottom: 6 }}>
						<Tag color='blue'>
							{record.startTime} - {record.endTime}
						</Tag>
					</div>
					<Space size={[4, 4]} wrap>
						{record.workDays.map((item) => (
							<Tag key={item}>{getWeekdayLabel(item)}</Tag>
						))}
					</Space>
				</div>
			),
		},
		{
			title: 'Đánh giá TB',
			align: 'center' as const,
			render: (_: any, record: Employee) => (
				<Tag color={getAverageRatingByEmployee(record.id) >= 4 ? 'green' : 'gold'}>
					{getAverageRatingByEmployee(record.id)}/5
				</Tag>
			),
		},
		{
			title: 'Thao tác',
			align: 'center' as const,
			render: (_: any, record: Employee) => (
				<Space>
					<Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
						Sửa
					</Button>
					<Button
						danger
						icon={<DeleteOutlined />}
						onClick={() => {
							Modal.confirm({
								title: 'Xóa nhân viên',
								content: `Bạn có chắc muốn xóa nhân viên "${record.name}" không?`,
								onOk: () => {
									deleteEmployee(record.id);
									message.success('Xóa nhân viên thành công');
									loadData();
								},
							});
						}}
					>
						Xóa
					</Button>
				</Space>
			),
		},
	];

	return (
		<PageContainer>
			<Row gutter={[16, 16]}>
				<Col span={8}>
					<Card style={cardStyle}>
						<Statistic title='Tổng nhân viên' value={summary.employees} prefix={<TeamOutlined />} />
					</Card>
				</Col>
				<Col span={8}>
					<Card style={cardStyle}>
						<Statistic title='Tổng lịch đã hoàn thành' value={summary.doneAppointments} />
					</Card>
				</Col>
				<Col span={8}>
					<Card style={cardStyle}>
						<Statistic title='Tổng đánh giá' value={summary.reviews} prefix={<StarOutlined />} />
					</Card>
				</Col>
			</Row>

			<Card style={{ ...cardStyle, marginTop: 16 }}>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						gap: 12,
						flexWrap: 'wrap',
						marginBottom: 16,
					}}
				>
					<div>
						<Title level={4} style={{ margin: 0 }}>
							Quản lý nhân viên
						</Title>
						<Text type='secondary'>Thêm, sửa, xóa nhân viên và cấu hình lịch làm việc riêng</Text>
					</div>
					<Button type='primary' icon={<PlusOutlined />} onClick={handleOpenCreate}>
						Thêm nhân viên
					</Button>
				</div>

				<Divider style={{ marginTop: 0 }} />

				<Table rowKey='id' dataSource={list} columns={columns} pagination={{ pageSize: 5 }} scroll={{ x: 1000 }} />
			</Card>

			<Modal
				title={editing ? 'Cập nhật nhân viên' : 'Thêm nhân viên'}
				visible={open}
				onCancel={() => setOpen(false)}
				onOk={handleSubmit}
				okText={editing ? 'Lưu thay đổi' : 'Tạo mới'}
				width={720}
				destroyOnClose
			>
				<Form form={form} layout='vertical'>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item name='name' label='Tên nhân viên' rules={[{ required: true, message: 'Nhập tên nhân viên' }]}>
								<Input placeholder='Ví dụ: Nguyễn Văn An' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='phone' label='Số điện thoại'>
								<Input placeholder='Ví dụ: 0901234567' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='specialty' label='Chuyên môn' rules={[{ required: true, message: 'Nhập chuyên môn' }]}>
								<Input placeholder='Ví dụ: Cắt tóc nam' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								name='maxCustomersPerDay'
								label='Giới hạn khách/ngày'
								rules={[{ required: true, message: 'Nhập giới hạn khách/ngày' }]}
							>
								<InputNumber min={1} style={{ width: '100%' }} />
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item
								name='workDays'
								label='Ngày làm việc'
								rules={[{ required: true, message: 'Chọn ngày làm việc' }]}
							>
								<Select mode='multiple' options={weekOptions} placeholder='Chọn các ngày làm việc' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='startTime' label='Giờ bắt đầu' rules={[{ required: true, message: 'Nhập giờ bắt đầu' }]}>
								<Input placeholder='09:00' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='endTime' label='Giờ kết thúc' rules={[{ required: true, message: 'Nhập giờ kết thúc' }]}>
								<Input placeholder='17:00' />
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</PageContainer>
	);
};

export default EmployeesPage;
