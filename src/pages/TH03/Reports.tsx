import React, { useEffect, useState } from 'react';
import { Card, Col, Divider, Progress, Row, Statistic, Table, Typography } from 'antd';
import { BarChartOutlined, DollarOutlined, ScheduleOutlined, TeamOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { formatCurrency, getRevenueStats, getSummaryStats, initStore } from '@/utils/appointmentStore';

const { Title, Text } = Typography;

const cardStyle: React.CSSProperties = {
	borderRadius: 16,
	boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
};

const ReportsPage: React.FC = () => {
	const [stats, setStats] = useState<any>({
		byService: [],
		byEmployee: [],
		byDay: [],
		byMonth: [],
	});

	const loadData = () => {
		initStore();
		setStats(getRevenueStats());
	};

	useEffect(() => {
		loadData();
	}, []);

	const summary = getSummaryStats();
	const maxServiceRevenue = Math.max(...stats.byService.map((item: any) => item.revenue), 0);
	const maxEmployeeRevenue = Math.max(...stats.byEmployee.map((item: any) => item.revenue), 0);

	return (
		<PageContainer>
			<Row gutter={[16, 16]}>
				<Col span={6}>
					<Card style={cardStyle}>
						<Statistic title='Tổng lịch hẹn' value={summary.appointments} prefix={<ScheduleOutlined />} />
					</Card>
				</Col>
				<Col span={6}>
					<Card style={cardStyle}>
						<Statistic
							title='Tổng doanh thu'
							value={formatCurrency(summary.totalRevenue)}
							prefix={<DollarOutlined />}
						/>
					</Card>
				</Col>
				<Col span={6}>
					<Card style={cardStyle}>
						<Statistic title='Tổng nhân viên' value={summary.employees} prefix={<TeamOutlined />} />
					</Card>
				</Col>
				<Col span={6}>
					<Card style={cardStyle}>
						<Statistic title='Tổng đánh giá' value={summary.reviews} prefix={<BarChartOutlined />} />
					</Card>
				</Col>
			</Row>

			<Card style={{ ...cardStyle, marginTop: 16 }}>
				<Title level={4} style={{ marginTop: 0 }}>
					Thống kê số lượng lịch hẹn theo ngày
				</Title>
				<Text type='secondary'>Theo dõi tần suất phát sinh lịch hẹn mỗi ngày</Text>
				<Divider />
				<Table
					rowKey='key'
					dataSource={stats.byDay}
					columns={[
						{ title: 'Ngày', dataIndex: 'date' },
						{ title: 'Số lượng lịch hẹn', dataIndex: 'totalAppointments', align: 'center' as const },
					]}
					pagination={false}
				/>
			</Card>

			<Card style={{ ...cardStyle, marginTop: 16 }}>
				<Title level={4} style={{ marginTop: 0 }}>
					Thống kê số lượng lịch hẹn theo tháng
				</Title>
				<Text type='secondary'>Phục vụ báo cáo nhanh cho giảng viên khi demo</Text>
				<Divider />
				<Table
					rowKey='key'
					dataSource={stats.byMonth}
					columns={[
						{ title: 'Tháng', dataIndex: 'month' },
						{ title: 'Số lượng lịch hẹn', dataIndex: 'totalAppointments', align: 'center' as const },
					]}
					pagination={false}
				/>
			</Card>

			<Card style={{ ...cardStyle, marginTop: 16 }}>
				<Title level={4} style={{ marginTop: 0 }}>
					Doanh thu theo dịch vụ
				</Title>
				<Divider />
				<Table
					rowKey='key'
					dataSource={stats.byService}
					columns={[
						{ title: 'Dịch vụ', dataIndex: 'name' },
						{ title: 'Số lịch hoàn thành', dataIndex: 'totalAppointments', align: 'center' as const },
						{
							title: 'Doanh thu',
							dataIndex: 'revenue',
							render: (value: number) => formatCurrency(value),
						},
						{
							title: 'Tỷ trọng',
							render: (_: any, record: any) => (
								<Progress
									percent={maxServiceRevenue ? Math.round((record.revenue / maxServiceRevenue) * 100) : 0}
									size='small'
								/>
							),
						},
					]}
					pagination={false}
				/>
			</Card>

			<Card style={{ ...cardStyle, marginTop: 16 }}>
				<Title level={4} style={{ marginTop: 0 }}>
					Doanh thu theo nhân viên
				</Title>
				<Divider />
				<Table
					rowKey='key'
					dataSource={stats.byEmployee}
					columns={[
						{ title: 'Nhân viên', dataIndex: 'name' },
						{ title: 'Chuyên môn', dataIndex: 'specialty' },
						{ title: 'Số lịch hoàn thành', dataIndex: 'totalAppointments', align: 'center' as const },
						{
							title: 'Doanh thu',
							dataIndex: 'revenue',
							render: (value: number) => formatCurrency(value),
						},
						{
							title: 'Đánh giá TB',
							dataIndex: 'averageRating',
							align: 'center' as const,
							render: (value: number) => `${value}/5`,
						},
						{
							title: 'Hiệu suất',
							render: (_: any, record: any) => (
								<Progress
									percent={maxEmployeeRevenue ? Math.round((record.revenue / maxEmployeeRevenue) * 100) : 0}
									size='small'
								/>
							),
						},
					]}
					pagination={false}
				/>
			</Card>
		</PageContainer>
	);
};

export default ReportsPage;
