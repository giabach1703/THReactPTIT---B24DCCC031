import React, { useEffect, useMemo, useState } from 'react';
import {
	Alert,
	Button,
	Card,
	Col,
	Empty,
	List,
	Modal,
	Row,
	Select,
	Space,
	Statistic,
	Tag,
	Typography,
	message,
} from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import {
	CATEGORY_LABELS,
	Destination,
	ItineraryItem,
	addPlanHistory,
	calculatePlanSummary,
	generateId,
	getCurrentItinerary,
	getDestinations,
	saveCurrentItinerary,
} from '@/utils/travelStore';

const { Title, Text } = Typography;

const LichTrinhPage: React.FC = () => {
	const [destinations, setDestinations] = useState<Destination[]>([]);
	const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
	const [selectedDestinationId, setSelectedDestinationId] = useState<string>();
	const [selectedDay, setSelectedDay] = useState<number>(1);

	const loadData = () => {
		setDestinations(getDestinations());
		setItinerary(getCurrentItinerary());
	};

	useEffect(() => {
		loadData();
		const handler = () => loadData();
		window.addEventListener('travel-storage', handler);
		return () => window.removeEventListener('travel-storage', handler);
	}, []);

	const maxDay = itinerary.length ? Math.max(...itinerary.map((item) => item.day)) : 1;

	const groupedDays = useMemo(() => {
		const days = Array.from({ length: maxDay }, (_, index) => index + 1);
		return days.map((day) => ({
			day,
			items: itinerary.filter((item) => item.day === day),
		}));
	}, [itinerary, maxDay]);

	const destinationMap = useMemo(() => {
		return new Map(destinations.map((item) => [item.id, item]));
	}, [destinations]);

	const summary = useMemo(() => {
		return calculatePlanSummary(itinerary, destinations);
	}, [itinerary, destinations]);

	const persistItinerary = (next: ItineraryItem[]) => {
		saveCurrentItinerary(next);
		setItinerary(next);
	};

	const handleAddToPlan = () => {
		if (!selectedDestinationId) {
			message.warning('Vui lòng chọn điểm đến');
			return;
		}

		const next = [
			...itinerary,
			{
				id: generateId(),
				day: selectedDay,
				destinationId: selectedDestinationId,
			},
		];

		persistItinerary(next);
		message.success('Đã thêm điểm đến vào lịch trình');
	};

	const handleRemove = (itemId: string) => {
		persistItinerary(itinerary.filter((item) => item.id !== itemId));
	};

	const handleMove = (day: number, itemId: string, direction: 'up' | 'down') => {
		const currentDayItems = itinerary.filter((item) => item.day === day);
		const currentIndex = currentDayItems.findIndex((item) => item.id === itemId);
		if (currentIndex === -1) return;

		const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
		if (targetIndex < 0 || targetIndex >= currentDayItems.length) return;

		const newDayItems = [...currentDayItems];
		[newDayItems[currentIndex], newDayItems[targetIndex]] = [newDayItems[targetIndex], newDayItems[currentIndex]];

		const rebuilt: ItineraryItem[] = [];
		for (let d = 1; d <= maxDay; d += 1) {
			if (d === day) rebuilt.push(...newDayItems);
			else rebuilt.push(...itinerary.filter((item) => item.day === d));
		}

		persistItinerary(rebuilt);
	};

	const handleChangeDay = (itemId: string, day: number) => {
		const next = itinerary.map((item) => (item.id === itemId ? { ...item, day } : item));
		persistItinerary(next);
	};

	const handleSavePlan = () => {
		if (!itinerary.length) {
			message.warning('Chưa có dữ liệu lịch trình để lưu');
			return;
		}

		addPlanHistory({
			id: generateId(),
			createdAt: new Date().toISOString(),
			items: itinerary,
			totalBudget: summary.totalBudget,
			categoryTotals: summary.categoryTotals,
			totalTravelMinutes: summary.totalTravelMinutes,
		});

		message.success('Đã lưu lịch trình vào thống kê admin');
	};

	const handleClear = () => {
		Modal.confirm({
			title: 'Xóa toàn bộ lịch trình?',
			content: 'Thao tác này sẽ xóa lịch trình hiện tại.',
			onOk: () => {
				persistItinerary([]);
				message.success('Đã xóa lịch trình');
			},
		});
	};

	return (
		<div style={{ padding: 16 }}>
			<Title level={3}>Tạo lịch trình du lịch</Title>

			<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
				<Col xs={24} lg={16}>
					<Card bordered={false} title='Thêm điểm đến vào lịch trình'>
						<Row gutter={[12, 12]}>
							<Col xs={24} md={12}>
								<Select
									placeholder='Chọn điểm đến'
									style={{ width: '100%' }}
									value={selectedDestinationId}
									onChange={setSelectedDestinationId}
									options={destinations.map((item) => ({
										label: `${item.name} - ${item.location}`,
										value: item.id,
									}))}
								/>
							</Col>
							<Col xs={24} md={6}>
								<Select
									style={{ width: '100%' }}
									value={selectedDay}
									onChange={setSelectedDay}
									options={Array.from({ length: maxDay + 1 }, (_, index) => ({
										label: `Ngày ${index + 1}`,
										value: index + 1,
									}))}
								/>
							</Col>
							<Col xs={24} md={6}>
								<Button type='primary' icon={<PlusOutlined />} block onClick={handleAddToPlan}>
									Thêm
								</Button>
							</Col>
						</Row>
					</Card>
				</Col>

				<Col xs={24} lg={8}>
					<Card bordered={false} title='Tóm tắt kế hoạch'>
						<Space direction='vertical' size={12} style={{ width: '100%' }}>
							<Statistic title='Số ngày' value={summary.totalDays} />
							<Statistic title='Số điểm đến' value={summary.totalDestinations} />
							<Statistic title='Tổng ngân sách' value={summary.totalBudget} suffix='đ' />
							<Statistic title='Thời gian di chuyển' value={summary.totalTravelMinutes} suffix='phút' />
							<Space wrap>
								<Button type='primary' icon={<SaveOutlined />} onClick={handleSavePlan}>
									Lưu lịch trình
								</Button>
								<Button danger onClick={handleClear}>
									Xóa lịch trình
								</Button>
							</Space>
						</Space>
					</Card>
				</Col>
			</Row>

			{itinerary.length === 0 ? (
				<Card bordered={false}>
					<Empty description='Chưa có điểm đến nào trong lịch trình' />
				</Card>
			) : (
				<Row gutter={[16, 16]}>
					<Col xs={24} xl={16}>
						<Space direction='vertical' size={16} style={{ width: '100%' }}>
							{groupedDays.map(({ day, items }) => (
								<Card
									key={day}
									bordered={false}
									title={`Ngày ${day}`}
									extra={<Tag color='blue'>{items.length} điểm đến</Tag>}
								>
									{items.length === 0 ? (
										<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='Chưa có điểm đến' />
									) : (
										<List
											itemLayout='vertical'
											dataSource={items}
											renderItem={(item, index) => {
												const destination = destinationMap.get(item.destinationId);
												if (!destination) return null;

												return (
													<List.Item
														actions={[
															<Button
																key='up'
																size='small'
																icon={<ArrowUpOutlined />}
																onClick={() => handleMove(day, item.id, 'up')}
															>
																Lên
															</Button>,
															<Button
																key='down'
																size='small'
																icon={<ArrowDownOutlined />}
																onClick={() => handleMove(day, item.id, 'down')}
															>
																Xuống
															</Button>,
															<Select
																key='day-select'
																size='small'
																style={{ width: 110 }}
																value={item.day}
																onChange={(value) => handleChangeDay(item.id, value)}
																options={Array.from({ length: maxDay + 1 }, (_, idx) => ({
																	label: `Ngày ${idx + 1}`,
																	value: idx + 1,
																}))}
															/>,
															<Button
																key='delete'
																danger
																size='small'
																icon={<DeleteOutlined />}
																onClick={() => handleRemove(item.id)}
															>
																Xóa
															</Button>,
														]}
													>
														<List.Item.Meta
															avatar={
																<img
																	src={destination.image}
																	alt={destination.name}
																	style={{
																		width: 100,
																		height: 70,
																		objectFit: 'cover',
																		borderRadius: 8,
																	}}
																/>
															}
															title={
																<Space wrap>
																	<span>
																		{index + 1}. {destination.name}
																	</span>
																	<Tag>{CATEGORY_LABELS[destination.category]}</Tag>
																</Space>
															}
															description={`${destination.location} • ${destination.visitHours} giờ tham quan • ${(
																destination.foodCost +
																destination.hotelCost +
																destination.transportCost
															).toLocaleString('vi-VN')} đ`}
														/>
													</List.Item>
												);
											}}
										/>
									)}
								</Card>
							))}
						</Space>
					</Col>

					<Col xs={24} xl={8}>
						<Card bordered={false} title='Ngân sách theo hạng mục'>
							<Space direction='vertical' size={12} style={{ width: '100%' }}>
								<Alert
									type='info'
									showIcon
									message={`Ăn uống: ${summary.categoryTotals.food.toLocaleString('vi-VN')} đ`}
								/>
								<Alert
									type='success'
									showIcon
									message={`Lưu trú: ${summary.categoryTotals.hotel.toLocaleString('vi-VN')} đ`}
								/>
								<Alert
									type='warning'
									showIcon
									message={`Di chuyển: ${summary.categoryTotals.transport.toLocaleString('vi-VN')} đ`}
								/>
								<Text type='secondary'>
									Thời gian di chuyển được ước tính giữa các điểm đến liên tiếp trong cùng một ngày.
								</Text>
							</Space>
						</Card>
					</Col>
				</Row>
			)}
		</div>
	);
};

export default LichTrinhPage;
