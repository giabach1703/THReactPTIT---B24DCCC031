import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, UnorderedListOutlined } from '@ant-design/icons';
import type { TaskItem } from '@/types/task';
import { getTasks, isOverdue } from '@/services/taskStorage';

const DashboardCongViec: React.FC = () => {
	const [tasks, setTasks] = useState<TaskItem[]>([]);

	useEffect(() => {
		setTasks(getTasks());
	}, []);

	const totalTasks = tasks.length;
	const completedTasks = tasks.filter((item) => item.status === 'done').length;
	const overdueTasks = tasks.filter((item) => isOverdue(item)).length;

	return (
		<div>
			<h2>Dashboard công việc</h2>

			<Row gutter={[16, 16]}>
				<Col xs={24} md={8}>
					<Card>
						<Statistic title='Tổng số task' value={totalTasks} prefix={<UnorderedListOutlined />} />
					</Card>
				</Col>

				<Col xs={24} md={8}>
					<Card>
						<Statistic title='Task hoàn thành' value={completedTasks} prefix={<CheckCircleOutlined />} />
					</Card>
				</Col>

				<Col xs={24} md={8}>
					<Card>
						<Statistic title='Task quá hạn' value={overdueTasks} prefix={<ClockCircleOutlined />} />
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default DashboardCongViec;
