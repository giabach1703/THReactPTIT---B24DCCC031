export type TaskStatus = 'todo' | 'doing' | 'done';

export type TaskPriority = 'high' | 'medium' | 'low';

export interface TaskItem {
	id: string;
	name: string;
	description: string;
	deadline: string;
	priority: TaskPriority;
	tag: string;
	status: TaskStatus;
	createdAt: string;
}

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
	todo: 'Cần làm',
	doing: 'Đang làm',
	done: 'Hoàn thành',
};

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
	high: 'Cao',
	medium: 'Trung bình',
	low: 'Thấp',
};
