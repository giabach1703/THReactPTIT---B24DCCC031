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
	Space,
	Statistic,
	Table,
	Typography,
	message,
} from 'antd';
import { AppstoreOutlined, ClockCircleOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import {
	ServiceItem,
	deleteService,
	formatCurrency,
	getServices,
	getSummaryStats,
	initStore,
	saveService,
} from '@/utils/appointmentStore';

const { Title, Text } = Typography;

const cardStyle: React.CSSProperties = {
	borderRadius: 16,
	boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
};

const ServicesPage: React.FC = () => {
	const [list, setList] = useState<ServiceItem[]>([]);
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<ServiceItem | null>(null);
	const [form] = Form.useForm();

	const loadData = () => {
		initStore();
		setList(getServices());
	};

	useEffect(() => {
		loadData();
	}, []);

	const summary = getSummaryStats();
	const avgDuration = list.length ? Math.round(list.reduce((sum, item) => sum + item.duration, 0) / list.length) : 0;

	const handleOpenCreate = () => {
		setEditing(null);
		form.resetFields();
		form.setFieldsValue({
			duration: 60,
			price: 100000,
		});
		setOpen(true);
	};

	const handleEdit = (record: ServiceItem) => {
		setEditing(record);
		form.setFieldsValue(record);
		setOpen(true);
	};

	const handleSubmit = async () => {
		const values = await form.validateFields();
		saveService({ ...editing, ...values });
		message.success(editing ? 'Cập nhật dịch vụ thành công' : 'Thêm dịch vụ thành công');
		setOpen(false);
		setEditing(null);
		form.resetFields();
		loadData();
	};

	const columns = [
		{
			title: 'Dịch vụ',
			render: (_: any, record: ServiceItem) => (
				<div>
					<div style={{ fontWeight: 600 }}>{record.name}</div>
					<div style={{ color: '#667085' }}>{record.description || 'Không có mô tả'}</div>
				</div>
			),
		},
		{
			title: 'Giá',
			dataIndex: 'price',
			render: (value: number) => <span style={{ fontWeight: 600 }}>{formatCurrency(value)}</span>,
		},
		{
			title: 'Thời gian',
			dataIndex: 'duration',
			align: 'center' as const,
			render: (value: number) => `${value} phút`,
		},
		{
			title: 'Thao tác',
			align: 'center' as const,
			render: (_: any, record: ServiceItem) => (
				<Space>
					<Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
						Sửa
					</Button>
					<Button
						danger
						icon={<DeleteOutlined />}
						onClick={() => {
							Modal.confirm({
								title: 'Xóa dịch vụ',
								content: `Bạn có chắc muốn xóa dịch vụ "${record.name}" không?`,
								onOk: () => {
									deleteService(record.id);
									message.success('Xóa dịch vụ thành công');
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
						<Statistic title='Tổng dịch vụ' value={summary.services} prefix={<AppstoreOutlined />} />
					</Card>
				</Col>
				<Col span={8}>
					<Card style={cardStyle}>
						<Statistic
							title='Thời lượng trung bình'
							value={avgDuration}
							suffix='phút'
							prefix={<ClockCircleOutlined />}
						/>
					</Card>
				</Col>
				<Col span={8}>
					<Card style={cardStyle}>
						<Statistic title='Doanh thu hoàn thành' value={formatCurrency(summary.totalRevenue)} />
					</Card>
				</Col>
			</Row>

			<Card style={{ ...cardStyle, marginTop: 16 }}>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						flexWrap: 'wrap',
						gap: 12,
						marginBottom: 16,
					}}
				>
					<div>
						<Title level={4} style={{ margin: 0 }}>
							Quản lý dịch vụ
						</Title>
						<Text type='secondary'>Quản lý danh sách dịch vụ, giá và thời gian thực hiện</Text>
					</div>
					<Button type='primary' icon={<PlusOutlined />} onClick={handleOpenCreate}>
						Thêm dịch vụ
					</Button>
				</div>

				<Divider style={{ marginTop: 0 }} />

				<Table rowKey='id' dataSource={list} columns={columns} pagination={{ pageSize: 5 }} />
			</Card>

			<Modal
				title={editing ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ'}
				visible={open}
				onCancel={() => setOpen(false)}
				onOk={handleSubmit}
				okText={editing ? 'Lưu thay đổi' : 'Tạo mới'}
				width={680}
				destroyOnClose
			>
				<Form form={form} layout='vertical'>
					<Row gutter={16}>
						<Col span={24}>
							<Form.Item name='name' label='Tên dịch vụ' rules={[{ required: true, message: 'Nhập tên dịch vụ' }]}>
								<Input placeholder='Ví dụ: Cắt tóc cơ bản' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='price' label='Giá dịch vụ' rules={[{ required: true, message: 'Nhập giá dịch vụ' }]}>
								<InputNumber min={0} style={{ width: '100%' }} placeholder='Ví dụ: 150000' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								name='duration'
								label='Thời gian thực hiện (phút)'
								rules={[{ required: true, message: 'Nhập thời gian thực hiện' }]}
							>
								<InputNumber min={5} style={{ width: '100%' }} placeholder='Ví dụ: 60' />
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item name='description' label='Mô tả'>
								<Input.TextArea rows={4} placeholder='Mô tả ngắn về dịch vụ' />
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</PageContainer>
	);
};

export default ServicesPage;
