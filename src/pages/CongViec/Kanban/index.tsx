import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Row, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import moment from 'moment';
import type { TaskItem, TaskStatus } from '@/types/task';
import { TASK_PRIORITY_LABEL, TASK_STATUS_LABEL } from '@/types/task';
import { addTask, getTasks, saveTasks, updateTask } from '@/services/taskStorage';
import TaskFormModal from '../components/TaskFormModal';

const { Text } = Typography;

const columns: TaskStatus[] = ['todo', 'doing', 'done'];

const getPriorityColor = (priority: string) => {
	if (priority === 'high') return 'red';
	if (priority === 'medium') return 'orange';
	return 'green';
};

const KanbanBoard: React.FC = () => {
	const [tasks, setTasks] = useState<TaskItem[]>([]);
	const [visible, setVisible] = useState(false);
	const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

	useEffect(() => {
		setTasks(getTasks());
	}, []);

	const handleDragEnd = (result: DropResult) => {
		const { destination, draggableId } = result;

		if (!destination) return;

		const newStatus = destination.droppableId as TaskStatus;

		const nextTasks = tasks.map((item) => {
			if (item.id !== draggableId) return item;

			return {
				...item,
				status: newStatus,
			};
		});

		setTasks(nextTasks);
		saveTasks(nextTasks);
	};

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

	return (
		<div>
			<Row justify='space-between' align='middle' style={{ marginBottom: 16 }}>
				<Col>
					<h2>Kanban Board</h2>
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

			<DragDropContext onDragEnd={handleDragEnd}>
				<Row gutter={16}>
					{columns.map((status) => {
						const columnTasks = tasks.filter((item) => item.status === status);

						return (
							<Col xs={24} md={8} key={status}>
								<Card title={`${TASK_STATUS_LABEL[status]} (${columnTasks.length})`} style={{ minHeight: 500 }}>
									<Droppable droppableId={status}>
										{(provided) => (
											<div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: 420 }}>
												{columnTasks.map((task, index) => (
													<Draggable key={task.id} draggableId={task.id} index={index}>
														{(providedDraggable) => (
															<Card
																size='small'
																ref={providedDraggable.innerRef}
																{...providedDraggable.draggableProps}
																{...providedDraggable.dragHandleProps}
																style={{
																	marginBottom: 12,
																	...providedDraggable.draggableProps.style,
																}}
																actions={[
																	<EditOutlined
																		key='edit'
																		onClick={() => {
																			setEditingTask(task);
																			setVisible(true);
																		}}
																	/>,
																]}
															>
																<h4 style={{ marginBottom: 8 }}>{task.name}</h4>

																<p style={{ marginBottom: 8 }}>{task.description || 'Không có mô tả'}</p>

																<div style={{ marginBottom: 8 }}>
																	<Tag color={getPriorityColor(task.priority)}>
																		{TASK_PRIORITY_LABEL[task.priority]}
																	</Tag>

																	{task.tag && <Tag>{task.tag}</Tag>}
																</div>

																<Text type='secondary'>Deadline: {moment(task.deadline).format('DD/MM/YYYY')}</Text>
															</Card>
														)}
													</Draggable>
												))}

												{provided.placeholder}
											</div>
										)}
									</Droppable>
								</Card>
							</Col>
						);
					})}
				</Row>
			</DragDropContext>

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

export default KanbanBoard;
