import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
	Badge,
	Button,
	Card,
	Col,
	DatePicker,
	Divider,
	Form,
	Input,
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
import {
	CalendarOutlined,
	CheckCircleOutlined,
	ClockCircleOutlined,
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import {
	Appointment,
	calcEndTime,
	deleteAppointment,
	formatCurrency,
	getAppointments,
	getEmployees,
	getServiceName,
	getServices,
	getStatusColor,
	getStatusLabel,
	getSummaryStats,
	initStore,
	saveAppointment,
} from '@/utils/appointmentStore';

const { Title, Text } = Typography;

const cardStyle: React.CSSProperties = {
	borderRadius: 16,
	boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
};

const statusOptions = [
	{ label: 'Chờ duyệt', value: 'PENDING' },
	{ label: 'Xác nhận', value: 'CONFIRMED' },
	{ label: 'Hoàn thành', value: 'DONE' },
	{ label: 'Hủy', value: 'CANCELLED' },
];

const AppointmentsPage: React.FC = () => {
	const [list, setList] = useState<Appointment[]>([]);
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<Appointment | null>(null);
	const [form] = Form.useForm();

	const loadData = () => {
		initStore();
		setList(getAppointments());
	};

	useEffect(() => {
		loadData();
	}, []);

	const employees = useMemo(() => getEmployees(), [list.length, open]);
	const services = useMemo(() => getServices(), [list.length, open]);
	const summary = getSummaryStats();

	const selectedServiceId = Form.useWatch('serviceId', form);
	const selectedStartTime = Form.useWatch('startTime', form);

	useEffect(() => {
		if (!selectedServiceId || !selectedStartTime) return;

		const service = services.find((item) => item.id === selectedServiceId);
		if (!service) return;

		form.setFieldsValue({
			endTime: calcEndTime(selectedStartTime, service.duration),
		});
	}, [selectedServiceId, selectedStartTime, services, form]);

	const handleOpenCreate = () => {
		setEditing(null);
		form.resetFields();
		form.setFieldsValue({
			status: 'PENDING',
			startTime: '09:00',
			endTime: '',
		});
		setOpen(true);
	};

	const handleEdit = (record: Appointment) => {
		setEditing(record);
		form.setFieldsValue({
			...record,
			date: dayjs(record.date),
		});
		setOpen(true);
	};

	const handleSubmit = async () => {
		const values = await form.validateFields();

		try {
			saveAppointment({
				...editing,
				...values,
				date: values.date.format('YYYY-MM-DD'),
			});

			message.success(editing ? 'Cập nhật lịch hẹn thành công' : 'Đặt lịch thành công');
			setOpen(false);
			setEditing(null);
			form.resetFields();
			loadData();
		} catch (error: any) {
			message.error(error.message || 'Có lỗi xảy ra');
		}
	};

	const updateStatus = (record: Appointment, status: Appointment['status']) => {
		try {
			saveAppointment({
				...record,
				status,
			});
			message.success('Cập nhật trạng thái thành công');
			loadData();
		} catch (error: any) {
			message.error(error.message || 'Có lỗi xảy ra');
		}
	};

	const columns = [
		{
			title: 'Khách hàng',
			render: (_: any, record: Appointment) => (
				<div>
					<div style={{ fontWeight: 600 }}>{record.customerName}</div>
					<div style={{ color: '#667085' }}>{record.customerPhone}</div>
				</div>
			),
		},
		{
			title: 'Nhân viên',
			render: (_: any, record: Appointment) => employees.find((item) => item.id === record.employeeId)?.name || '',
		},
		{
			title: 'Dịch vụ',
			render: (_: any, record: Appointment) => {
				const service = services.find((item) => item.id === record.serviceId);
				return (
					<div>
						<div>{service?.name}</div>
						<div style={{ color: '#667085' }}>{service ? formatCurrency(service.price) : ''}</div>
					</div>
				);
			},
		},
		{
			title: 'Ngày hẹn',
			dataIndex: 'date',
		},
		{
			title: 'Khung giờ',
			render: (_: any, record: Appointment) => (
				<Tag color='processing'>
					{record.startTime} - {record.endTime}
				</Tag>
			),
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			render: (value: Appointment['status']) => <Tag color={getStatusColor(value)}>{getStatusLabel(value)}</Tag>,
		},
		{
			title: 'Ghi chú',
			dataIndex: 'note',
			render: (value: string) => value || <span style={{ color: '#999' }}>Không có</span>,
		},
		{
			title: 'Thao tác',
			render: (_: any, record: Appointment) => (
				<Space wrap>
					<Button type='primary' ghost size='small' icon={<EditOutlined />} onClick={() => handleEdit(record)}>
						Sửa lịch
					</Button>

					<Button
						danger
						size='small'
						icon={<DeleteOutlined />}
						onClick={() => {
							Modal.confirm({
								title: 'Xóa lịch hẹn',
								content: `Bạn có chắc muốn xóa lịch của khách "${record.customerName}" không?`,
								okText: 'Xóa',
								cancelText: 'Hủy',
								onOk: () => {
									deleteAppointment(record.id);
									message.success('Xóa lịch hẹn thành công');
									loadData();
								},
							});
						}}
					>
						Xóa lịch
					</Button>

					<Button
						size='small'
						onClick={() => updateStatus(record, 'CONFIRMED')}
						disabled={record.status === 'CONFIRMED'}
					>
						Xác nhận
					</Button>

					<Button
						size='small'
						type='primary'
						onClick={() => updateStatus(record, 'DONE')}
						disabled={record.status === 'DONE'}
					>
						Hoàn thành
					</Button>

					<Button
						size='small'
						danger
						onClick={() => updateStatus(record, 'CANCELLED')}
						disabled={record.status === 'CANCELLED'}
					>
						Hủy lịch
					</Button>
				</Space>
			),
		},
	];

	return (
		<PageContainer>
			<Row gutter={[16, 16]}>
				<Col span={6}>
					<Card style={cardStyle}>
						<Statistic title='Tổng lịch hẹn' value={summary.appointments} prefix={<CalendarOutlined />} />
					</Card>
				</Col>
				<Col span={6}>
					<Card style={cardStyle}>
						<Statistic title='Chờ duyệt' value={summary.pendingAppointments} prefix={<ClockCircleOutlined />} />
					</Card>
				</Col>
				<Col span={6}>
					<Card style={cardStyle}>
						<Statistic title='Đã hoàn thành' value={summary.doneAppointments} prefix={<CheckCircleOutlined />} />
					</Card>
				</Col>
				<Col span={6}>
					<Card style={cardStyle}>
						<Statistic title='Dịch vụ hiện có' value={summary.services} />
					</Card>
				</Col>
			</Row>

			<Card style={{ ...cardStyle, marginTop: 16 }}>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						gap: 12,
						alignItems: 'center',
						flexWrap: 'wrap',
						marginBottom: 16,
					}}
				>
					<div>
						<Title level={4} style={{ margin: 0 }}>
							Quản lý lịch hẹn
						</Title>
						<Text type='secondary'>
							Đặt lịch, sửa lịch, xóa lịch, kiểm tra trùng lịch và cập nhật trạng thái phục vụ
						</Text>
					</div>

					<Space>
						<Badge count={summary.pendingAppointments} color='#faad14' />
						<Button type='primary' icon={<PlusOutlined />} onClick={handleOpenCreate}>
							Đặt lịch hẹn
						</Button>
					</Space>
				</div>

				<Divider style={{ marginTop: 0 }} />

				<Table rowKey='id' dataSource={list} columns={columns} scroll={{ x: 1400 }} pagination={{ pageSize: 6 }} />
			</Card>

			<Modal
				title={editing ? 'Cập nhật lịch hẹn' : 'Đặt lịch hẹn'}
				visible={open}
				onCancel={() => {
					setOpen(false);
					setEditing(null);
					form.resetFields();
				}}
				onOk={handleSubmit}
				okText={editing ? 'Lưu thay đổi' : 'Đặt lịch'}
				cancelText='Đóng'
				width={800}
				destroyOnClose
			>
				<Form form={form} layout='vertical' initialValues={{ status: 'PENDING' }}>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item
								name='customerName'
								label='Tên khách hàng'
								rules={[{ required: true, message: 'Nhập tên khách hàng' }]}
							>
								<Input placeholder='Ví dụ: Phạm Minh Khoa' />
							</Form.Item>
						</Col>

						<Col span={12}>
							<Form.Item
								name='customerPhone'
								label='Số điện thoại'
								rules={[{ required: true, message: 'Nhập số điện thoại' }]}
							>
								<Input placeholder='Ví dụ: 0901234567' />
							</Form.Item>
						</Col>

						<Col span={12}>
							<Form.Item
								name='employeeId'
								label='Nhân viên phục vụ'
								rules={[{ required: true, message: 'Chọn nhân viên' }]}
							>
								<Select
									placeholder='Chọn nhân viên'
									options={employees.map((item) => ({
										label: `${item.name} - ${item.specialty}`,
										value: item.id,
									}))}
								/>
							</Form.Item>
						</Col>

						<Col span={12}>
							<Form.Item name='serviceId' label='Dịch vụ' rules={[{ required: true, message: 'Chọn dịch vụ' }]}>
								<Select
									placeholder='Chọn dịch vụ'
									options={services.map((item) => ({
										label: `${item.name} - ${formatCurrency(item.price)} - ${item.duration} phút`,
										value: item.id,
									}))}
								/>
							</Form.Item>
						</Col>

						<Col span={12}>
							<Form.Item name='date' label='Ngày hẹn' rules={[{ required: true, message: 'Chọn ngày hẹn' }]}>
								<DatePicker style={{ width: '100%' }} format='DD/MM/YYYY' />
							</Form.Item>
						</Col>

						<Col span={12}>
							<Form.Item name='status' label='Trạng thái' rules={[{ required: true, message: 'Chọn trạng thái' }]}>
								<Select options={statusOptions} />
							</Form.Item>
						</Col>

						<Col span={12}>
							<Form.Item name='startTime' label='Giờ bắt đầu' rules={[{ required: true, message: 'Nhập giờ bắt đầu' }]}>
								<Input placeholder='Ví dụ: 09:00' />
							</Form.Item>
						</Col>

						<Col span={12}>
							<Form.Item
								name='endTime'
								label='Giờ kết thúc'
								rules={[{ required: true, message: 'Giờ kết thúc chưa được tạo' }]}
							>
								<Input disabled placeholder='Tự động tính theo thời lượng dịch vụ' />
							</Form.Item>
						</Col>

						<Col span={24}>
							<Form.Item name='note' label='Ghi chú'>
								<Input.TextArea
									rows={4}
									placeholder={`Ví dụ: Khách muốn sử dụng thêm ${getServiceName(selectedServiceId || '')}`}
								/>
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</PageContainer>
	);
};

export default AppointmentsPage;
