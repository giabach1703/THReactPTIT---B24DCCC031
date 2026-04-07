import React, { useEffect, useMemo, useState } from 'react';
import type { UploadProps } from 'antd';
import {
	Alert,
	Button,
	Card,
	Col,
	Form,
	Image,
	Input,
	InputNumber,
	Modal,
	Row,
	Select,
	Space,
	Statistic,
	Table,
	Typography,
	Upload,
	message,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import PieBudgetChart from '@/components/PieBudgetChart';
import SimpleBarChart from '@/components/SimpleBarChart';
import {
	CATEGORY_LABELS,
	Destination,
	DestinationCategory,
	generateId,
	getDestinationTotalCost,
	getDestinations,
	getPlanHistory,
	saveDestinations,
} from '@/utils/travelStore';

const { Title, Text } = Typography;

const AdminDiemDenPage: React.FC = () => {
	const [destinations, setDestinations] = useState<Destination[]>([]);
	const [history, setHistory] = useState<any[]>([]);
	const [open, setOpen] = useState(false);
	const [editingRecord, setEditingRecord] = useState<Destination | null>(null);
	const [form] = Form.useForm();

	const loadData = () => {
		setDestinations(getDestinations());
		setHistory(getPlanHistory());
	};

	useEffect(() => {
		loadData();
		const handler = () => loadData();
		window.addEventListener('travel-storage', handler);
		return () => window.removeEventListener('travel-storage', handler);
	}, []);

	const imageValue = Form.useWatch('image', form);

	const monthlyData = useMemo(() => {
		const map = new Map<string, number>();

		history.forEach((item) => {
			const date = new Date(item.createdAt);
			const label = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
			map.set(label, (map.get(label) || 0) + 1);
		});

		return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
	}, [history]);

	const revenueTotal = useMemo(() => {
		return history.reduce((sum, item) => sum + item.totalBudget, 0);
	}, [history]);

	const categoryTotals = useMemo(() => {
		return history.reduce(
			(acc, item) => {
				acc.food += item.categoryTotals.food;
				acc.hotel += item.categoryTotals.hotel;
				acc.transport += item.categoryTotals.transport;
				return acc;
			},
			{ food: 0, hotel: 0, transport: 0 },
		);
	}, [history]);

	const popularDestinations = useMemo(() => {
		const counter = new Map<string, number>();
		const destinationMap = new Map(destinations.map((item) => [item.id, item.name]));

		history.forEach((record) => {
			record.items.forEach((it: any) => {
				const name = destinationMap.get(it.destinationId);
				if (!name) return;
				counter.set(name, (counter.get(name) || 0) + 1);
			});
		});

		return Array.from(counter.entries())
			.map(([label, value]) => ({ label, value }))
			.sort((a, b) => b.value - a.value)
			.slice(0, 5);
	}, [destinations, history]);

	const openCreateModal = () => {
		setEditingRecord(null);
		form.resetFields();
		setOpen(true);
	};

	const openEditModal = (record: Destination) => {
		setEditingRecord(record);
		form.setFieldsValue(record);
		setOpen(true);
	};

	const handleDelete = (record: Destination) => {
		Modal.confirm({
			title: `Xóa điểm đến "${record.name}"?`,
			onOk: () => {
				saveDestinations(destinations.filter((item) => item.id !== record.id));
				message.success('Đã xóa điểm đến');
			},
		});
	};

	const toBase64 = (file: File) =>
		new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(String(reader.result || ''));
			reader.onerror = (error) => reject(error);
		});

	const uploadProps: UploadProps = {
		showUploadList: false,
		beforeUpload: async (file) => {
			const base64 = await toBase64(file as File);
			form.setFieldsValue({ image: base64 });
			message.success('Tải ảnh thành công');
			return false;
		},
	};

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();

			const payload: Destination = {
				id: editingRecord?.id || generateId(),
				name: values.name,
				location: values.location,
				category: values.category as DestinationCategory,
				image: values.image,
				rating: Number(values.rating),
				description: values.description,
				visitHours: Number(values.visitHours),
				foodCost: Number(values.foodCost),
				hotelCost: Number(values.hotelCost),
				transportCost: Number(values.transportCost),
			};

			if (editingRecord) {
				saveDestinations(destinations.map((item) => (item.id === editingRecord.id ? payload : item)));
				message.success('Cập nhật điểm đến thành công');
			} else {
				saveDestinations([payload, ...destinations]);
				message.success('Thêm điểm đến thành công');
			}

			setOpen(false);
			form.resetFields();
			setEditingRecord(null);
		} catch (error) {}
	};

	return (
		<div style={{ padding: 16 }}>
			<Row justify='space-between' align='middle' style={{ marginBottom: 16 }}>
				<Col>
					<Title level={3} style={{ margin: 0 }}>
						Trang quản trị điểm đến
					</Title>
					<Text type='secondary'>Quản lý điểm đến, hình ảnh, chi phí và xem thống kê lịch trình.</Text>
				</Col>
				<Col>
					<Button type='primary' icon={<PlusOutlined />} onClick={openCreateModal}>
						Thêm điểm đến
					</Button>
				</Col>
			</Row>

			<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
				<Col xs={24} sm={12} lg={6}>
					<Card bordered={false}>
						<Statistic title='Tổng điểm đến' value={destinations.length} />
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card bordered={false}>
						<Statistic title='Lịch trình đã lưu' value={history.length} />
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card bordered={false}>
						<Statistic title='Tổng tiền thu về' value={revenueTotal} suffix='đ' />
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card bordered={false}>
						<Statistic
							title='Địa điểm được chọn nhiều nhất'
							value={popularDestinations.length ? popularDestinations[0].label : 'Chưa có'}
						/>
					</Card>
				</Col>
			</Row>

			<Card bordered={false} title='Danh sách điểm đến' style={{ marginBottom: 24 }}>
				<Table
					rowKey='id'
					scroll={{ x: 1200 }}
					dataSource={destinations}
					columns={[
						{
							title: 'Ảnh',
							dataIndex: 'image',
							width: 100,
							render: (value: string) => (
								<Image
									src={value}
									alt='destination'
									width={80}
									height={56}
									style={{ objectFit: 'cover', borderRadius: 8 }}
								/>
							),
						},
						{
							title: 'Tên điểm đến',
							dataIndex: 'name',
						},
						{
							title: 'Địa điểm',
							dataIndex: 'location',
						},
						{
							title: 'Loại hình',
							dataIndex: 'category',
							render: (value: DestinationCategory) => CATEGORY_LABELS[value],
						},
						{
							title: 'Rating',
							dataIndex: 'rating',
						},
						{
							title: 'Tham quan',
							dataIndex: 'visitHours',
							render: (value: number) => `${value} giờ`,
						},
						{
							title: 'Tổng chi phí',
							render: (_, record: Destination) => `${getDestinationTotalCost(record).toLocaleString('vi-VN')} đ`,
						},
						{
							title: 'Thao tác',
							fixed: 'right',
							width: 180,
							render: (_, record: Destination) => (
								<Space>
									<Button type='primary' ghost icon={<EditOutlined />} onClick={() => openEditModal(record)}>
										Sửa
									</Button>
									<Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
										Xóa
									</Button>
								</Space>
							),
						},
					]}
				/>
			</Card>

			<Row gutter={[16, 16]}>
				<Col xs={24} xl={12}>
					<Card bordered={false} title='Số lượt lịch trình được tạo theo tháng'>
						<SimpleBarChart data={monthlyData} color='#1677ff' />
					</Card>
				</Col>

				<Col xs={24} xl={12}>
					<Card bordered={false} title='Địa điểm phổ biến'>
						<SimpleBarChart data={popularDestinations} color='#52c41a' />
					</Card>
				</Col>

				<Col xs={24} xl={12}>
					<Card bordered={false} title='Tổng tiền theo từng hạng mục'>
						<PieBudgetChart
							data={[
								{ label: 'Ăn uống', value: categoryTotals.food, color: '#1677ff' },
								{ label: 'Lưu trú', value: categoryTotals.hotel, color: '#52c41a' },
								{ label: 'Di chuyển', value: categoryTotals.transport, color: '#faad14' },
							]}
						/>
					</Card>
				</Col>

				<Col xs={24} xl={12}>
					<Card bordered={false} title='Ghi chú thống kê'>
						<Space direction='vertical' size={12} style={{ width: '100%' }}>
							<Alert
								showIcon
								type='info'
								message='“Tổng tiền thu về” trong bài này được hiểu là tổng giá trị các lịch trình đã lưu.'
							/>
							<Alert showIcon type='success' message={`Ăn uống: ${categoryTotals.food.toLocaleString('vi-VN')} đ`} />
							<Alert showIcon type='success' message={`Lưu trú: ${categoryTotals.hotel.toLocaleString('vi-VN')} đ`} />
							<Alert
								showIcon
								type='success'
								message={`Di chuyển: ${categoryTotals.transport.toLocaleString('vi-VN')} đ`}
							/>
						</Space>
					</Card>
				</Col>
			</Row>

			<Modal
				title={editingRecord ? 'Cập nhật điểm đến' : 'Thêm điểm đến'}
				visible={open}
				onOk={handleSubmit}
				onCancel={() => {
					setOpen(false);
					setEditingRecord(null);
					form.resetFields();
				}}
				width={860}
				destroyOnClose
			>
				<Form form={form} layout='vertical'>
					<Row gutter={[12, 12]}>
						<Col xs={24} md={12}>
							<Form.Item label='Tên điểm đến' name='name' rules={[{ required: true, message: 'Nhập tên điểm đến' }]}>
								<Input />
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item label='Địa điểm' name='location' rules={[{ required: true, message: 'Nhập địa điểm' }]}>
								<Input />
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item label='Loại hình' name='category' rules={[{ required: true, message: 'Chọn loại hình' }]}>
								<Select
									options={[
										{ label: 'Biển', value: 'beach' },
										{ label: 'Núi', value: 'mountain' },
										{ label: 'Thành phố', value: 'city' },
									]}
								/>
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item label='Rating' name='rating' rules={[{ required: true, message: 'Nhập rating' }]}>
								<InputNumber min={1} max={5} step={0.1} style={{ width: '100%' }} />
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								label='Thời gian tham quan (giờ)'
								name='visitHours'
								rules={[{ required: true, message: 'Nhập thời gian tham quan' }]}
							>
								<InputNumber min={1} style={{ width: '100%' }} />
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								label='Chi ăn uống'
								name='foodCost'
								rules={[{ required: true, message: 'Nhập chi phí ăn uống' }]}
							>
								<InputNumber min={0} step={50000} style={{ width: '100%' }} />
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								label='Chi lưu trú'
								name='hotelCost'
								rules={[{ required: true, message: 'Nhập chi phí lưu trú' }]}
							>
								<InputNumber min={0} step={50000} style={{ width: '100%' }} />
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								label='Chi di chuyển'
								name='transportCost'
								rules={[{ required: true, message: 'Nhập chi phí di chuyển' }]}
							>
								<InputNumber min={0} step={50000} style={{ width: '100%' }} />
							</Form.Item>
						</Col>

						<Col xs={24}>
							<Form.Item label='Mô tả' name='description' rules={[{ required: true, message: 'Nhập mô tả' }]}>
								<Input.TextArea rows={4} />
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								label='Ảnh điểm đến'
								name='image'
								rules={[{ required: true, message: 'Vui lòng upload ảnh hoặc nhập URL ảnh' }]}
							>
								<Input placeholder='Dán URL ảnh hoặc bấm nút upload' />
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<div style={{ marginBottom: 8, fontWeight: 500 }}>Upload ảnh</div>
							<Upload {...uploadProps}>
								<Button icon={<UploadOutlined />}>Chọn ảnh từ máy</Button>
							</Upload>
						</Col>

						{imageValue ? (
							<Col xs={24}>
								<Image src={imageValue} alt='preview' width={220} style={{ borderRadius: 12, objectFit: 'cover' }} />
							</Col>
						) : null}
					</Row>
				</Form>
			</Modal>
		</div>
	);
};

export default AdminDiemDenPage;
