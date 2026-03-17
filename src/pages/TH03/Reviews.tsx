import React, { useEffect, useMemo, useState } from 'react';
import {
	Button,
	Card,
	Col,
	Divider,
	Form,
	Input,
	InputNumber,
	Modal,
	Progress,
	Row,
	Space,
	Table,
	Tag,
	Typography,
	message,
} from 'antd';
import { CommentOutlined, MessageOutlined, StarOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import {
	Appointment,
	ReviewItem,
	getAppointments,
	getAverageRatingByEmployee,
	getEmployees,
	getReviews,
	getServiceName,
	initStore,
	saveReview,
} from '@/utils/appointmentStore';

const { Title, Text } = Typography;

const cardStyle: React.CSSProperties = {
	borderRadius: 16,
	boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
};

const ReviewsPage: React.FC = () => {
	const [reviews, setReviews] = useState<ReviewItem[]>([]);
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [openReview, setOpenReview] = useState(false);
	const [openReply, setOpenReply] = useState(false);
	const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
	const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
	const [reviewForm] = Form.useForm();
	const [replyForm] = Form.useForm();

	const employees = useMemo(() => getEmployees(), [reviews.length, appointments.length]);

	const loadData = () => {
		initStore();
		setReviews(getReviews());
		setAppointments(getAppointments().filter((item) => item.status === 'DONE'));
	};

	useEffect(() => {
		loadData();
	}, []);

	const reviewedAppointmentIds = reviews.map((item) => item.appointmentId);
	const canReviewAppointments = appointments.filter((item) => !reviewedAppointmentIds.includes(item.id));
	const averageAll =
		reviews.length > 0 ? Number((reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1)) : 0;

	const handleSaveReview = async () => {
		const values = await reviewForm.validateFields();
		if (!selectedAppointment) return;

		saveReview({
			appointmentId: selectedAppointment.id,
			employeeId: selectedAppointment.employeeId,
			serviceId: selectedAppointment.serviceId,
			customerName: selectedAppointment.customerName,
			rating: values.rating,
			content: values.content,
		});

		message.success('Đánh giá thành công');
		setOpenReview(false);
		setSelectedAppointment(null);
		reviewForm.resetFields();
		loadData();
	};

	const handleReply = async () => {
		const values = await replyForm.validateFields();
		if (!selectedReview) return;

		saveReview({
			...selectedReview,
			reply: values.reply,
		});

		message.success('Phản hồi đánh giá thành công');
		setOpenReply(false);
		setSelectedReview(null);
		replyForm.resetFields();
		loadData();
	};

	const columns = [
		{
			title: 'Khách hàng',
			dataIndex: 'customerName',
		},
		{
			title: 'Nhân viên',
			render: (_: any, record: ReviewItem) => employees.find((item) => item.id === record.employeeId)?.name,
		},
		{
			title: 'Dịch vụ',
			render: (_: any, record: ReviewItem) => getServiceName(record.serviceId),
		},
		{
			title: 'Điểm',
			dataIndex: 'rating',
			align: 'center' as const,
			render: (value: number) => <Tag color={value >= 4 ? 'green' : value >= 3 ? 'gold' : 'red'}>{value}/5</Tag>,
		},
		{
			title: 'Đánh giá',
			render: (_: any, record: ReviewItem) => (
				<div>
					<div>{record.content}</div>
					<div style={{ color: '#98a2b3', fontSize: 12, marginTop: 4 }}>{record.createdAt}</div>
				</div>
			),
		},
		{
			title: 'Phản hồi',
			render: (_: any, record: ReviewItem) =>
				record.reply ? <span>{record.reply}</span> : <span style={{ color: '#98a2b3' }}>Chưa phản hồi</span>,
		},
		{
			title: 'Thao tác',
			render: (_: any, record: ReviewItem) => (
				<Button
					icon={<MessageOutlined />}
					onClick={() => {
						setSelectedReview(record);
						replyForm.setFieldsValue({ reply: record.reply });
						setOpenReply(true);
					}}
				>
					Phản hồi
				</Button>
			),
		},
	];

	return (
		<PageContainer>
			<Row gutter={[16, 16]}>
				<Col span={8}>
					<Card style={cardStyle}>
						<Space>
							<StarOutlined style={{ fontSize: 22 }} />
							<div>
								<div style={{ color: '#667085' }}>Điểm trung bình toàn hệ thống</div>
								<div style={{ fontSize: 28, fontWeight: 700 }}>{averageAll}/5</div>
							</div>
						</Space>
					</Card>
				</Col>
				<Col span={8}>
					<Card style={cardStyle}>
						<Space>
							<CommentOutlined style={{ fontSize: 22 }} />
							<div>
								<div style={{ color: '#667085' }}>Tổng lượt đánh giá</div>
								<div style={{ fontSize: 28, fontWeight: 700 }}>{reviews.length}</div>
							</div>
						</Space>
					</Card>
				</Col>
				<Col span={8}>
					<Card style={cardStyle}>
						<Space>
							<MessageOutlined style={{ fontSize: 22 }} />
							<div>
								<div style={{ color: '#667085' }}>Lịch chờ đánh giá</div>
								<div style={{ fontSize: 28, fontWeight: 700 }}>{canReviewAppointments.length}</div>
							</div>
						</Space>
					</Card>
				</Col>
			</Row>

			<Card title='Lịch hẹn đã hoàn thành - có thể đánh giá' style={{ ...cardStyle, marginTop: 16 }}>
				<Space wrap size={[16, 16]}>
					{canReviewAppointments.length === 0 && <Tag color='default'>Hiện chưa có lịch nào chờ đánh giá</Tag>}
					{canReviewAppointments.map((item) => {
						const employee = employees.find((e) => e.id === item.employeeId);
						return (
							<Card
								key={item.id}
								size='small'
								hoverable
								style={{
									width: 320,
									borderRadius: 14,
									border: '1px solid #f0f0f0',
								}}
							>
								<p>
									<b>Khách:</b> {item.customerName}
								</p>
								<p>
									<b>Nhân viên:</b> {employee?.name}
								</p>
								<p>
									<b>Dịch vụ:</b> {getServiceName(item.serviceId)}
								</p>
								<p>
									<b>Ngày:</b> {item.date}
								</p>
								<Button
									type='primary'
									block
									onClick={() => {
										setSelectedAppointment(item);
										setOpenReview(true);
									}}
								>
									Đánh giá ngay
								</Button>
							</Card>
						);
					})}
				</Space>
			</Card>

			<Card style={{ ...cardStyle, marginTop: 16 }}>
				<Title level={4} style={{ marginTop: 0 }}>
					Điểm trung bình theo nhân viên
				</Title>
				<Divider />
				<Row gutter={[16, 16]}>
					{employees.map((item) => {
						const avg = getAverageRatingByEmployee(item.id);
						return (
							<Col span={8} key={item.id}>
								<Card size='small' style={{ borderRadius: 14 }}>
									<div style={{ fontWeight: 700, marginBottom: 8 }}>{item.name}</div>
									<div style={{ color: '#667085', marginBottom: 12 }}>{item.specialty}</div>
									<Progress percent={avg * 20} showInfo={false} />
									<div style={{ marginTop: 8, fontWeight: 600 }}>{avg}/5</div>
								</Card>
							</Col>
						);
					})}
				</Row>
			</Card>

			<Card style={{ ...cardStyle, marginTop: 16 }}>
				<Title level={4} style={{ marginTop: 0 }}>
					Danh sách đánh giá
				</Title>
				<Divider />
				<Table rowKey='id' dataSource={reviews} columns={columns} pagination={{ pageSize: 5 }} />
			</Card>

			<Modal
				title='Đánh giá dịch vụ'
				visible={openReview}
				onCancel={() => setOpenReview(false)}
				onOk={handleSaveReview}
				okText='Gửi đánh giá'
				destroyOnClose
			>
				<Form form={reviewForm} layout='vertical'>
					<Form.Item name='rating' label='Số sao' rules={[{ required: true, message: 'Nhập số sao' }]}>
						<InputNumber min={1} max={5} style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item
						name='content'
						label='Nội dung đánh giá'
						rules={[{ required: true, message: 'Nhập nội dung đánh giá' }]}
					>
						<Input.TextArea rows={4} placeholder='Ví dụ: Nhân viên phục vụ tận tình, dịch vụ tốt...' />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title='Phản hồi đánh giá'
				visible={openReply}
				onCancel={() => setOpenReply(false)}
				onOk={handleReply}
				okText='Gửi phản hồi'
				destroyOnClose
			>
				<Form form={replyForm} layout='vertical'>
					<Form.Item
						name='reply'
						label='Nội dung phản hồi'
						rules={[{ required: true, message: 'Nhập nội dung phản hồi' }]}
					>
						<Input.TextArea rows={4} placeholder='Ví dụ: Cảm ơn anh/chị đã sử dụng dịch vụ...' />
					</Form.Item>
				</Form>
			</Modal>
		</PageContainer>
	);
};

export default ReviewsPage;
