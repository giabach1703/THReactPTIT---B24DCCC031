import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Empty, Rate, Row, Select, Space, Statistic, Tag, Typography, message } from 'antd';
import { EnvironmentOutlined, PlusOutlined } from '@ant-design/icons';
import {
	CATEGORY_LABELS,
	Destination,
	DestinationCategory,
	generateId,
	getCurrentItinerary,
	getDestinationTotalCost,
	getDestinations,
	saveCurrentItinerary,
} from '@/utils/travelStore';

const { Title, Text, Paragraph } = Typography;

type SortValue = 'ratingDesc' | 'priceAsc' | 'priceDesc' | 'nameAsc';

const categoryOptions = [
	{ label: 'Tất cả loại hình', value: 'all' },
	{ label: 'Biển', value: 'beach' },
	{ label: 'Núi', value: 'mountain' },
	{ label: 'Thành phố', value: 'city' },
];

const priceOptions = [
	{ label: 'Tất cả mức giá', value: 'all' },
	{ label: 'Dưới 2.000.000', value: 'lt2' },
	{ label: '2.000.000 - 3.000.000', value: '2to3' },
	{ label: 'Trên 3.000.000', value: 'gt3' },
];

const sortOptions = [
	{ label: 'Đánh giá cao nhất', value: 'ratingDesc' },
	{ label: 'Chi phí thấp nhất', value: 'priceAsc' },
	{ label: 'Chi phí cao nhất', value: 'priceDesc' },
	{ label: 'Tên A-Z', value: 'nameAsc' },
];

const TrangChuPage: React.FC = () => {
	const [destinations, setDestinations] = useState<Destination[]>([]);
	const [category, setCategory] = useState<'all' | DestinationCategory>('all');
	const [priceRange, setPriceRange] = useState<string>('all');
	const [minRating, setMinRating] = useState<number>(0);
	const [sortBy, setSortBy] = useState<SortValue>('ratingDesc');

	const loadData = () => {
		setDestinations(getDestinations());
	};

	useEffect(() => {
		loadData();
		const handler = () => loadData();
		window.addEventListener('travel-storage', handler);
		return () => window.removeEventListener('travel-storage', handler);
	}, []);

	const filteredDestinations = useMemo(() => {
		const next = [...destinations]
			.filter((item) => (category === 'all' ? true : item.category === category))
			.filter((item) => item.rating >= minRating)
			.filter((item) => {
				const total = getDestinationTotalCost(item);
				if (priceRange === 'lt2') return total < 2000000;
				if (priceRange === '2to3') return total >= 2000000 && total <= 3000000;
				if (priceRange === 'gt3') return total > 3000000;
				return true;
			});

		next.sort((a, b) => {
			if (sortBy === 'ratingDesc') return b.rating - a.rating;
			if (sortBy === 'priceAsc') return getDestinationTotalCost(a) - getDestinationTotalCost(b);
			if (sortBy === 'priceDesc') return getDestinationTotalCost(b) - getDestinationTotalCost(a);
			return a.name.localeCompare(b.name);
		});

		return next;
	}, [category, destinations, minRating, priceRange, sortBy]);

	const handleQuickAdd = (destinationId: string) => {
		const current = getCurrentItinerary();
		const currentMaxDay = current.length ? Math.max(...current.map((item) => item.day)) : 1;

		saveCurrentItinerary([
			...current,
			{
				id: generateId(),
				day: currentMaxDay,
				destinationId,
			},
		]);

		message.success('Đã thêm điểm đến vào lịch trình hiện tại');
	};

	return (
		<div style={{ padding: 16 }}>
			<div
				style={{
					background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
					borderRadius: 20,
					padding: 24,
					color: '#fff',
					marginBottom: 24,
				}}
			>
				<Title level={2} style={{ color: '#fff', marginBottom: 8 }}>
					Ứng dụng lập kế hoạch du lịch
				</Title>
				<Paragraph style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 0 }}>
					Khám phá điểm đến, tạo lịch trình, quản lý ngân sách và theo dõi thống kê quản trị.
				</Paragraph>
			</div>

			<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
				<Col xs={24} sm={12} md={8} lg={6}>
					<Card bordered={false}>
						<Statistic title='Tổng điểm đến' value={destinations.length} />
					</Card>
				</Col>
				<Col xs={24} sm={12} md={8} lg={6}>
					<Card bordered={false}>
						<Statistic title='Điểm nổi bật' value={destinations.filter((item) => item.rating >= 4.8).length} />
					</Card>
				</Col>
				<Col xs={24} sm={12} md={8} lg={6}>
					<Card bordered={false}>
						<Statistic
							title='Chi phí thấp nhất'
							value={destinations.length ? Math.min(...destinations.map((item) => getDestinationTotalCost(item))) : 0}
							suffix='đ'
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} md={8} lg={6}>
					<Card bordered={false}>
						<Statistic
							title='Chi phí trung bình'
							value={
								destinations.length
									? Math.round(
											destinations.reduce((sum, item) => sum + getDestinationTotalCost(item), 0) / destinations.length,
									  )
									: 0
							}
							suffix='đ'
						/>
					</Card>
				</Col>
			</Row>

			<Card bordered={false} style={{ marginBottom: 24 }}>
				<Row gutter={[12, 12]}>
					<Col xs={24} md={12} lg={6}>
						<Select
							style={{ width: '100%' }}
							value={category}
							options={categoryOptions}
							onChange={(value) => setCategory(value)}
						/>
					</Col>
					<Col xs={24} md={12} lg={6}>
						<Select
							style={{ width: '100%' }}
							value={priceRange}
							options={priceOptions}
							onChange={(value) => setPriceRange(value)}
						/>
					</Col>
					<Col xs={24} md={12} lg={6}>
						<Select
							style={{ width: '100%' }}
							value={minRating}
							options={[
								{ label: 'Mọi đánh giá', value: 0 },
								{ label: 'Từ 4.0 trở lên', value: 4 },
								{ label: 'Từ 4.5 trở lên', value: 4.5 },
								{ label: 'Từ 4.8 trở lên', value: 4.8 },
							]}
							onChange={(value) => setMinRating(value)}
						/>
					</Col>
					<Col xs={24} md={12} lg={6}>
						<Select
							style={{ width: '100%' }}
							value={sortBy}
							options={sortOptions}
							onChange={(value) => setSortBy(value)}
						/>
					</Col>
				</Row>
			</Card>

			{filteredDestinations.length === 0 ? (
				<Card bordered={false}>
					<Empty description='Không có điểm đến phù hợp bộ lọc' />
				</Card>
			) : (
				<Row gutter={[16, 16]}>
					{filteredDestinations.map((item) => (
						<Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
							<Card
								hoverable
								bordered={false}
								cover={<img src={item.image} alt={item.name} style={{ height: 220, objectFit: 'cover' }} />}
								actions={[
									<Button type='link' icon={<PlusOutlined />} onClick={() => handleQuickAdd(item.id)} key='add'>
										Thêm vào lịch trình
									</Button>,
								]}
							>
								<Space direction='vertical' size={10} style={{ width: '100%' }}>
									<div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
										<Title level={5} style={{ margin: 0 }}>
											{item.name}
										</Title>
										<Tag color='blue'>{CATEGORY_LABELS[item.category]}</Tag>
									</div>

									<Text type='secondary'>
										<EnvironmentOutlined /> {item.location}
									</Text>

									<Rate allowHalf disabled value={item.rating} />
									<Text strong>{item.rating}/5</Text>

									<Paragraph ellipsis={{ rows: 2 }} style={{ minHeight: 44 }}>
										{item.description}
									</Paragraph>

									<div>
										<Text strong>Thời gian tham quan: </Text>
										<Text>{item.visitHours} giờ</Text>
									</div>

									<div>
										<Text strong>Chi phí dự kiến: </Text>
										<Text>{getDestinationTotalCost(item).toLocaleString('vi-VN')} đ</Text>
									</div>
								</Space>
							</Card>
						</Col>
					))}
				</Row>
			)}
		</div>
	);
};

export default TrangChuPage;
