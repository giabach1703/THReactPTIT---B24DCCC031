import moment from 'moment';
import type { TaskItem, TaskStatus } from '@/types/task';

const STORAGE_KEY = 'personal_kanban_tasks';

const defaultTasks: TaskItem[] = [
	{
		id: '1',
		name: 'Hoàn thành báo cáo thực hành',
		description: 'Xây dựng chức năng quản lý công việc cá nhân',
		deadline: moment().add(1, 'days').format('YYYY-MM-DD'),
		priority: 'high',
		tag: 'Học tập',
		status: 'todo',
		createdAt: new Date().toISOString(),
	},
	{
		id: '2',
		name: 'Thiết kế giao diện Kanban',
		description: 'Chia task theo 3 trạng thái',
		deadline: moment().format('YYYY-MM-DD'),
		priority: 'medium',
		tag: 'UI',
		status: 'doing',
		createdAt: new Date().toISOString(),
	},
	{
		id: '3',
		name: 'Kiểm tra lưu localStorage',
		description: 'Refresh trang vẫn giữ dữ liệu',
		deadline: moment().subtract(1, 'days').format('YYYY-MM-DD'),
		priority: 'low',
		tag: 'Test',
		status: 'done',
		createdAt: new Date().toISOString(),
	},
];

export const getTasks = (): TaskItem[] => {
	const rawData = localStorage.getItem(STORAGE_KEY);

	if (!rawData) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTasks));
		return defaultTasks;
	}

	try {
		return JSON.parse(rawData);
	} catch (error) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTasks));
		return defaultTasks;
	}
};

export const saveTasks = (tasks: TaskItem[]) => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const addTask = (task: Omit<TaskItem, 'id' | 'createdAt'>) => {
	const tasks = getTasks();

	const newTask: TaskItem = {
		...task,
		id: `${Date.now()}`,
		createdAt: new Date().toISOString(),
	};

	const nextTasks = [newTask, ...tasks];
	saveTasks(nextTasks);

	return nextTasks;
};

export const updateTask = (id: string, task: Omit<TaskItem, 'id' | 'createdAt'>) => {
	const tasks = getTasks();

	const nextTasks = tasks.map((item) => {
		if (item.id !== id) return item;

		return {
			...item,
			...task,
		};
	});

	saveTasks(nextTasks);

	return nextTasks;
};

export const updateTaskStatus = (id: string, status: TaskStatus) => {
	const tasks = getTasks();

	const nextTasks = tasks.map((item) => {
		if (item.id !== id) return item;

		return {
			...item,
			status,
		};
	});

	saveTasks(nextTasks);

	return nextTasks;
};

export const deleteTask = (id: string) => {
	const tasks = getTasks();
	const nextTasks = tasks.filter((item) => item.id !== id);

	saveTasks(nextTasks);

	return nextTasks;
};

export const isOverdue = (task: TaskItem) => {
	if (task.status === 'done') return false;

	return moment(task.deadline, 'YYYY-MM-DD').isBefore(moment().startOf('day'));
};
