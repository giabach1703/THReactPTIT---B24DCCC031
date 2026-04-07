import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Card, Col, InputNumber, Row, Statistic, Table, Typography } from 'antd';
import PieBudgetChart from '@/components/PieBudgetChart';
import { calculatePlanSummary, getCurrentItinerary, getDestinations } from '@/utils/travelStore';

const { Title, Paragraph } = Typography;

const BUDGET_LIMIT_KEY = 'travel_budget_limit';

const NganSachPage: React.FC = () => {
	const [budgetLimit, setBudgetLimit] = useState<number>(5000000);
	const [summary, setSummary] = useState(calculatePlanSummary(getCurrentItinerary(), getDestinations()));

	const loadData = () => {
		const itinerary = getCurrentItinerary();
		const destinations = getDestinations();
		setSummary(calculatePlanSummary(itinerary, destinations));
	};

	useEffect(() => {
		const savedLimit = Number(localStorage.getItem(BUDGET_LIMIT_KEY) || 5000000);
		setBudgetLimit(savedLimit);

		loadData();
		const handler = () => loadData();
		window.addEventListener('travel-storage', handler);
		return () => window.removeEventListener('travel-storage', handler);
	}, []);

	useEffect(() => {
		localStorage.setItem(BUDGET_LIMIT_KEY, String(budgetLimit || 0));
	}, [budgetLimit]);

	const chartData = useMemo(
		() => [
			{
				label: 'Ăn uống',
				value: summary.categoryTotals.food,
				color: '#1677ff',
			},
			{
				label: 'Lưu trú',
				value: summary.categoryTotals.hotel,
				color: '#52c41a',
			},
			{
				label: 'Di chuyển',
				value: summary.categoryTotals.transport,
				color: '#faad14',
			},
		],
		[summary],
	);

	const exceeded = summary.totalBudget > budgetLimit;
	const usagePercent = budgetLimit ? Math.round((summary.totalBudget / budgetLimit) * 100) : 0;

	return (
		<div style={{ padding: 16 }}>
			<Title level={3}>Quản lý ngân sách</Title>
			<Paragraph>Theo dõi phân bổ chi phí theo hạng mục, cảnh báo vượt ngân sách và thời gian di chuyển.</Paragraph>

			<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
				<Col xs={24} md={12} lg={6}>
					<Card bordered={false}>
						<Statistic title='Tổng ngân sách hiện tại' value={summary.totalBudget} suffix='đ' />
					</Card>
				</Col>
				<Col xs={24} md={12} lg={6}>
					<Card bordered={false}>
						<Statistic title='Ngân sách đặt ra' value={budgetLimit} suffix='đ' />
					</Card>
				</Col>
				<Col xs={24} md={12} lg={6}>
					<Card bordered={false}>
						<Statistic title='Mức sử dụng' value={usagePercent} suffix='%' />
					</Card>
				</Col>
				<Col xs={24} md={12} lg={6}>
					<Card bordered={false}>
						<Statistic title='Thời gian di chuyển' value={summary.totalTravelMinutes} suffix='phút' />
					</Card>
				</Col>
			</Row>

			<Card bordered={false} style={{ marginBottom: 24 }}>
				<Row gutter={[16, 16]} align='middle'>
					<Col xs={24} md={10}>
						<div style={{ fontWeight: 600, marginBottom: 8 }}>Thiết lập ngân sách mục tiêu</div>
						<InputNumber
							style={{ width: '100%' }}
							min={0}
							step={100000}
							value={budgetLimit}
							onChange={(value) => setBudgetLimit(Number(value || 0))}
						/>
					</Col>
					<Col xs={24} md={14}>
						<Alert
							showIcon
							type={exceeded ? 'error' : usagePercent >= 85 ? 'warning' : 'success'}
							message={
								exceeded
									? `Đã vượt ngân sách ${(summary.totalBudget - budgetLimit).toLocaleString('vi-VN')} đ`
									: usagePercent >= 85
									? 'Ngân sách đang gần chạm ngưỡng'
									: 'Ngân sách hiện vẫn trong giới hạn'
							}
						/>
					</Col>
				</Row>
			</Card>

			<Row gutter={[16, 16]}>
				<Col xs={24} lg={14}>
					<Card bordered={false} title='Biểu đồ phân bổ ngân sách'>
						<PieBudgetChart data={chartData} />
					</Card>
				</Col>

				<Col xs={24} lg={10}>
					<Card bordered={false} title='Chi tiết hạng mục'>
						<Table
							rowKey='label'
							pagination={false}
							dataSource={[
								{
									label: 'Ăn uống',
									value: summary.categoryTotals.food,
								},
								{
									label: 'Lưu trú',
									value: summary.categoryTotals.hotel,
								},
								{
									label: 'Di chuyển',
									value: summary.categoryTotals.transport,
								},
							]}
							columns={[
								{
									title: 'Hạng mục',
									dataIndex: 'label',
								},
								{
									title: 'Chi phí',
									dataIndex: 'value',
									render: (value: number) => `${value.toLocaleString('vi-VN')} đ`,
								},
							]}
						/>
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default NganSachPage;
