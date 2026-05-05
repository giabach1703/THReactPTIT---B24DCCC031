import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Input, Popconfirm, Row, Select, Space, Table, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import type { ColumnsType } from 'antd/es/table';
import type { TaskItem, TaskStatus } from '@/types/task';
import { TASK_PRIORITY_LABEL, TASK_STATUS_LABEL } from '@/types/task';
import { addTask, deleteTask, getTasks, updateTask } from '@/services/taskStorage';
import TaskFormModal from '../components/TaskFormModal';

const { Search } = Input;
const { Option } = Select;

const getPriorityColor = (priority: string) => {
	if (priority === 'high') return 'red';
	if (priority === 'medium') return 'orange';
	return 'green';
};

const getStatusColor = (status: string) => {
	if (status === 'done') return 'green';
	if (status === 'doing') return 'blue';
	return 'default';
};

const DanhSachTask: React.FC = () => {
	const [tasks, setTasks] = useState<TaskItem[]>([]);
	const [keyword, setKeyword] = useState('');
	const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
	const [visible, setVisible] = useState(false);
	const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

	useEffect(() => {
		setTasks(getTasks());
	}, []);

	const filteredTasks = useMemo(() => {
		return tasks.filter((item) => {
			const matchKeyword = item.name.toLowerCase().includes(keyword.toLowerCase());

			const matchStatus = statusFilter === 'all' ? true : item.status === statusFilter;

			return matchKeyword && matchStatus;
		});
	}, [tasks, keyword, statusFilter]);

	const handleSubmit = (values: any) => {
		if (editingTask) {
			const nextTasks = updateTask(editingTask.id, values);
			setTasks(nextTasks);
		} else {
			const nextTasks = addTask(values);
			setTasks(nextTasks);
		}

		setVisible(false);
		setEditingTask(null);
	};

	const handleDelete = (id: string) => {
		const nextTasks = deleteTask(id);
		setTasks(nextTasks);
	};

	const columns: ColumnsType<TaskItem> = [
		{
			title: 'Tên task',
			dataIndex: 'name',
			key: 'name',
			width: 220,
		},
		{
			title: 'Mô tả',
			dataIndex: 'description',
			key: 'description',
			ellipsis: true,
		},
		{
			title: 'Deadline',
			dataIndex: 'deadline',
			key: 'deadline',
			width: 150,
			sorter: (a, b) => moment(a.deadline).unix() - moment(b.deadline).unix(),
			render: (value: string) => moment(value).format('DD/MM/YYYY'),
		},
		{
			title: 'Ưu tiên',
			dataIndex: 'priority',
			key: 'priority',
			width: 130,
			render: (value: TaskItem['priority']) => <Tag color={getPriorityColor(value)}>{TASK_PRIORITY_LABEL[value]}</Tag>,
		},
		{
			title: 'Tag',
			dataIndex: 'tag',
			key: 'tag',
			width: 120,
			render: (value: string) => (value ? <Tag>{value}</Tag> : '-'),
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			key: 'status',
			width: 140,
			render: (value: TaskItem['status']) => <Tag color={getStatusColor(value)}>{TASK_STATUS_LABEL[value]}</Tag>,
		},
		{
			title: 'Thao tác',
			key: 'action',
			width: 140,
			render: (_, record) => (
				<Space>
					<Button
						size='small'
						icon={<EditOutlined />}
						onClick={() => {
							setEditingTask(record);
							setVisible(true);
						}}
					/>

					<Popconfirm
						title='Bạn có chắc muốn xóa task này?'
						okText='Xóa'
						cancelText='Hủy'
						onConfirm={() => handleDelete(record.id)}
					>
						<Button size='small' danger icon={<DeleteOutlined />} />
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div>
			<Row justify='space-between' align='middle' style={{ marginBottom: 16 }}>
				<Col>
					<h2>Danh sách task</h2>
				</Col>

				<Col>
					<Button
						type='primary'
						icon={<PlusOutlined />}
						onClick={() => {
							setEditingTask(null);
							setVisible(true);
						}}
					>
						Thêm task
					</Button>
				</Col>
			</Row>

			<Card style={{ marginBottom: 16 }}>
				<Row gutter={16}>
					<Col xs={24} md={12}>
						<Search
							placeholder='Tìm kiếm theo tên task'
							allowClear
							onSearch={(value) => setKeyword(value)}
							onChange={(event) => setKeyword(event.target.value)}
						/>
					</Col>

					<Col xs={24} md={6}>
						<Select style={{ width: '100%' }} value={statusFilter} onChange={(value) => setStatusFilter(value)}>
							<Option value='all'>Tất cả trạng thái</Option>
							<Option value='todo'>Cần làm</Option>
							<Option value='doing'>Đang làm</Option>
							<Option value='done'>Hoàn thành</Option>
						</Select>
					</Col>
				</Row>
			</Card>

			<Table rowKey='id' columns={columns} dataSource={filteredTasks} pagination={{ pageSize: 5 }} />

			<TaskFormModal
				visible={visible}
				editingTask={editingTask}
				onCancel={() => {
					setVisible(false);
					setEditingTask(null);
				}}
				onSubmit={handleSubmit}
			/>
		</div>
	);
};

export default DanhSachTask;
