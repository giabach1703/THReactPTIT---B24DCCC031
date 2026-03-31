import React, { useMemo, useState } from 'react';
import { Card, Col, Row, Statistic, Button, Space } from 'antd';
import ReactApexChart from 'react-apexcharts';
import { clubStore } from '@/utils/clubStore';

const ClubReportsPage: React.FC = () => {
	const [reloadKey, setReloadKey] = useState(0);

	const stats = useMemo(() => clubStore.getSummaryStats(), [reloadKey]);
	const chartData = useMemo(() => clubStore.getChartData(), [reloadKey]);

	const clubNames = Array.from(new Set(chartData.map((item) => item.clubName)));

	const pendingData = clubNames.map(
		(clubName) => chartData.find((item) => item.clubName === clubName && item.status === 'Pending')?.value || 0,
	);

	const approvedData = clubNames.map(
		(clubName) => chartData.find((item) => item.clubName === clubName && item.status === 'Approved')?.value || 0,
	);

	const rejectedData = clubNames.map(
		(clubName) => chartData.find((item) => item.clubName === clubName && item.status === 'Rejected')?.value || 0,
	);

	const series = [
		{
			name: 'Pending',
			data: pendingData,
		},
		{
			name: 'Approved',
			data: approvedData,
		},
		{
			name: 'Rejected',
			data: rejectedData,
		},
	];

	const options: any = {
		chart: {
			type: 'bar',
			height: 420,
			toolbar: {
				show: true,
			},
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '55%',
			},
		},
		dataLabels: {
			enabled: false,
		},
		stroke: {
			show: true,
			width: 1,
			colors: ['transparent'],
		},
		xaxis: {
			categories: clubNames,
			title: {
				text: 'Tên câu lạc bộ',
			},
		},
		yaxis: {
			title: {
				text: 'Số lượng đơn đăng ký',
			},
		},
		legend: {
			position: 'top',
		},
		fill: {
			opacity: 1,
		},
		tooltip: {
			y: {
				formatter: function (val: number) {
					return `${val} đơn`;
				},
			},
		},
	};

	return (
		<Space direction='vertical' size={16} style={{ width: '100%' }}>
			<Card
				title='Báo cáo và thống kê'
				extra={<Button onClick={() => setReloadKey((prev) => prev + 1)}>Làm mới dữ liệu</Button>}
			>
				<Row gutter={[16, 16]}>
					<Col xs={24} sm={12} lg={6}>
						<Card bordered={false}>
							<Statistic title='Số CLB' value={stats.clubCount} />
						</Card>
					</Col>
					<Col xs={24} sm={12} lg={6}>
						<Card bordered={false}>
							<Statistic title='Đơn Pending' value={stats.pendingCount} />
						</Card>
					</Col>
					<Col xs={24} sm={12} lg={6}>
						<Card bordered={false}>
							<Statistic title='Đơn Approved' value={stats.approvedCount} />
						</Card>
					</Col>
					<Col xs={24} sm={12} lg={6}>
						<Card bordered={false}>
							<Statistic title='Đơn Rejected' value={stats.rejectedCount} />
						</Card>
					</Col>
				</Row>
			</Card>

			<Card title='Biểu đồ số đơn đăng ký theo từng câu lạc bộ'>
				<ReactApexChart options={options} series={series} type='bar' height={420} />
			</Card>
		</Space>
	);
};

export default ClubReportsPage;
