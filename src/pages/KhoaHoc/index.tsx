import React, { useMemo, useRef, useState } from 'react';
import {
	Button,
	Card,
	Col,
	Form,
	Input,
	InputNumber,
	Modal,
	Popconfirm,
	Row,
	Select,
	Space,
	Table,
	Tag,
	Tooltip,
	Typography,
	message,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

type CourseStatus = 'DANG_MO' | 'DA_KET_THUC' | 'TAM_DUNG';

interface LecturerItem {
	id: number;
	name: string;
}

interface CourseItem {
	id: number;
	name: string;
	lecturerId: number;
	lecturerName: string;
	studentCount: number;
	description: string;
	status: CourseStatus;
	createdAt: string;
	updatedAt: string;
}

interface CourseFormValues {
	name: string;
	lecturerId: number;
	studentCount: number;
	description: string;
	status: CourseStatus;
}

const COURSE_STATUS_LABEL = {
	DANG_MO: 'Đang mở',
	DA_KET_THUC: 'Đã kết thúc',
	TAM_DUNG: 'Tạm dừng',
};

const COURSE_STATUS_OPTIONS = [
	{ label: 'Đang mở', value: 'DANG_MO' as CourseStatus },
	{ label: 'Đã kết thúc', value: 'DA_KET_THUC' as CourseStatus },
	{ label: 'Tạm dừng', value: 'TAM_DUNG' as CourseStatus },
];
const INITIAL_LECTURERS: LecturerItem[] = [
	{ id: 1, name: 'Nguyễn Văn An' },
	{ id: 2, name: 'Trần Thị Bình' },
	{ id: 3, name: 'Lê Minh Cường' },
	{ id: 4, name: 'Phạm Thu Dung' },
];

const INITIAL_COURSES: CourseItem[] = [
	{
		id: 1,
		name: 'ReactJS cơ bản',
		lecturerId: 1,
		lecturerName: 'Nguyễn Văn An',
		studentCount: 28,
		description: '<p>Khóa học ReactJS cơ bản dành cho người mới bắt đầu.</p>',
		status: 'DANG_MO',
		createdAt: '2026-04-01T08:00:00.000Z',
		updatedAt: '2026-04-01T08:00:00.000Z',
	},
	{
		id: 2,
		name: 'NodeJS thực chiến',
		lecturerId: 2,
		lecturerName: 'Trần Thị Bình',
		studentCount: 0,
		description: '<p>Khóa học NodeJS và Express để xây dựng REST API.</p>',
		status: 'TAM_DUNG',
		createdAt: '2026-04-02T08:00:00.000Z',
		updatedAt: '2026-04-02T08:00:00.000Z',
	},
	{
		id: 3,
		name: 'TypeScript nâng cao',
		lecturerId: 3,
		lecturerName: 'Lê Minh Cường',
		studentCount: 42,
		description: '<p>Khóa học TypeScript nâng cao cho lập trình frontend.</p>',
		status: 'DA_KET_THUC',
		createdAt: '2026-04-03T08:00:00.000Z',
		updatedAt: '2026-04-03T08:00:00.000Z',
	},
];

function stripHtml(html: string): string {
	return String(html || '')
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function truncateText(text: string, maxLength: number): string {
	if (!text) return '';
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength)}...`;
}

function getStatusTagColor(status: CourseStatus) {
	if (status === 'DANG_MO') return 'blue';
	if (status === 'DA_KET_THUC') return 'default';
	return 'orange';
}

const KhoaHocPage: React.FC = () => {
	const [form] = Form.useForm();
	const nextIdRef = useRef<number>(Math.max(...INITIAL_COURSES.map((item) => item.id)) + 1);

	const [lecturers] = useState<LecturerItem[]>(INITIAL_LECTURERS);
	const [courses, setCourses] = useState<CourseItem[]>(INITIAL_COURSES);

	const [searchText, setSearchText] = useState<string>('');
	const [lecturerFilter, setLecturerFilter] = useState<number | undefined>(undefined);
	const [statusFilter, setStatusFilter] = useState<CourseStatus | undefined>(undefined);

	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const [editingRecord, setEditingRecord] = useState<CourseItem | null>(null);
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);

	const filteredCourses = useMemo(() => {
		return courses.filter((item) => {
			const matchName = item.name.toLowerCase().includes(searchText.trim().toLowerCase());
			const matchLecturer = lecturerFilter ? item.lecturerId === lecturerFilter : true;
			const matchStatus = statusFilter ? item.status === statusFilter : true;
			return matchName && matchLecturer && matchStatus;
		});
	}, [courses, searchText, lecturerFilter, statusFilter]);

	const handleReloadSampleData = () => {
		setCourses(INITIAL_COURSES);
		setSearchText('');
		setLecturerFilter(undefined);
		setStatusFilter(undefined);
		setEditingRecord(null);
		setModalVisible(false);
		form.resetFields();
		nextIdRef.current = Math.max(...INITIAL_COURSES.map((item) => item.id)) + 1;
		message.success('Đã tải lại dữ liệu mẫu');
	};

	const openCreateModal = () => {
		setEditingRecord(null);
		setModalVisible(true);
		form.resetFields();
		form.setFieldsValue({
			studentCount: 0,
			status: 'DANG_MO',
		});
	};

	const openEditModal = (record: CourseItem) => {
		setEditingRecord(record);
		setModalVisible(true);
		form.setFieldsValue({
			name: record.name,
			lecturerId: record.lecturerId,
			studentCount: record.studentCount,
			description: record.description,
			status: record.status,
		});
	};

	const closeModal = () => {
		setModalVisible(false);
		setEditingRecord(null);
		form.resetFields();
	};

	const handleDelete = (record: CourseItem) => {
		if (record.studentCount > 0) {
			message.error('Chỉ được xóa khóa học chưa có học viên');
			return;
		}

		setCourses((prev) => prev.filter((item) => item.id !== record.id));
		message.success('Xóa khóa học thành công');
	};

	const handleSubmit = async () => {
		try {
			const values = (await form.validateFields()) as CourseFormValues;
			setSubmitLoading(true);

			const lecturer = lecturers.find((item) => item.id === values.lecturerId);
			if (!lecturer) {
				message.error('Giảng viên không tồn tại');
				setSubmitLoading(false);
				return;
			}

			const now = new Date().toISOString();
			const normalizedName = values.name.trim();
			const normalizedDescription = values.description.trim();

			if (editingRecord) {
				const updatedItem: CourseItem = {
					...editingRecord,
					name: normalizedName,
					lecturerId: values.lecturerId,
					lecturerName: lecturer.name,
					studentCount: Number(values.studentCount),
					description: normalizedDescription,
					status: values.status,
					updatedAt: now,
				};

				setCourses((prev) => prev.map((item) => (item.id === editingRecord.id ? updatedItem : item)));
				message.success('Cập nhật khóa học thành công');
			} else {
				const newItem: CourseItem = {
					id: nextIdRef.current,
					name: normalizedName,
					lecturerId: values.lecturerId,
					lecturerName: lecturer.name,
					studentCount: Number(values.studentCount),
					description: normalizedDescription,
					status: values.status,
					createdAt: now,
					updatedAt: now,
				};

				nextIdRef.current += 1;
				setCourses((prev) => [newItem, ...prev]);
				message.success('Thêm mới khóa học thành công');
			}

			closeModal();
		} catch (error) {
			// validate lỗi thì không làm gì
		} finally {
			setSubmitLoading(false);
		}
	};

	const columns = [
		{
			title: 'ID khóa học',
			dataIndex: 'id',
			width: 120,
			sorter: (a: CourseItem, b: CourseItem) => a.id - b.id,
		},
		{
			title: 'Tên khóa học',
			dataIndex: 'name',
			sorter: (a: CourseItem, b: CourseItem) => a.name.localeCompare(b.name),
		},
		{
			title: 'Giảng viên',
			dataIndex: 'lecturerName',
			width: 180,
			sorter: (a: CourseItem, b: CourseItem) => a.lecturerName.localeCompare(b.lecturerName),
		},
		{
			title: 'Số lượng học viên',
			dataIndex: 'studentCount',
			width: 170,
			sorter: (a: CourseItem, b: CourseItem) => a.studentCount - b.studentCount,
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			width: 150,
			render: (value: CourseStatus) => <Tag color={getStatusTagColor(value)}>{COURSE_STATUS_LABEL[value]}</Tag>,
		},
		{
			title: 'Mô tả',
			dataIndex: 'description',
			render: (value: string) => {
				const text = truncateText(stripHtml(value), 80);
				return <span>{text || '-'}</span>;
			},
		},
		{
			title: 'Thao tác',
			key: 'action',
			width: 180,
			render: (_: any, record: CourseItem) => {
				const cannotDelete = record.studentCount > 0;

				return (
					<Space>
						<Button type='link' icon={<EditOutlined />} onClick={() => openEditModal(record)}>
							Sửa
						</Button>

						{cannotDelete ? (
							<Tooltip title='Chỉ được xóa khóa học chưa có học viên'>
								<span>
									<Button type='link' danger icon={<DeleteOutlined />} disabled>
										Xóa
									</Button>
								</span>
							</Tooltip>
						) : (
							<Popconfirm
								title='Bạn có chắc chắn muốn xóa khóa học này?'
								okText='Xóa'
								cancelText='Hủy'
								onConfirm={() => handleDelete(record)}
							>
								<Button type='link' danger icon={<DeleteOutlined />}>
									Xóa
								</Button>
							</Popconfirm>
						)}
					</Space>
				);
			},
		},
	];

	return (
		<div style={{ padding: 24 }}>
			<Card>
				<Row justify='space-between' align='middle' gutter={[16, 16]}>
					<Col>
						<Title level={3} style={{ marginBottom: 4 }}>
							Quản lý khóa học online
						</Title>
						<Text type='secondary'>Danh sách khóa học, thêm mới, chỉnh sửa, xóa và lọc dữ liệu</Text>
					</Col>

					<Col>
						<Space>
							<Button icon={<ReloadOutlined />} onClick={handleReloadSampleData}>
								Tải lại
							</Button>
							<Button type='primary' icon={<PlusOutlined />} onClick={openCreateModal}>
								Thêm khóa học
							</Button>
						</Space>
					</Col>
				</Row>

				<div style={{ marginTop: 24, marginBottom: 16 }}>
					<Row gutter={[12, 12]}>
						<Col xs={24} sm={24} md={10} lg={8}>
							<Input
								allowClear
								value={searchText}
								placeholder='Tìm theo tên khóa học'
								prefix={<SearchOutlined />}
								onChange={(e) => setSearchText(e.target.value)}
							/>
						</Col>

						<Col xs={24} sm={12} md={7} lg={5}>
							<Select
								allowClear
								style={{ width: '100%' }}
								placeholder='Lọc theo giảng viên'
								value={lecturerFilter}
								onChange={(value) => setLecturerFilter(value)}
								getPopupContainer={(trigger) => trigger.parentElement || document.body}
							>
								{lecturers.map((lecturer) => (
									<Option key={lecturer.id} value={lecturer.id}>
										{lecturer.name}
									</Option>
								))}
							</Select>
						</Col>

						<Col xs={24} sm={12} md={7} lg={5}>
							<Select
								allowClear
								style={{ width: '100%' }}
								placeholder='Lọc theo trạng thái'
								value={statusFilter}
								onChange={(value) => setStatusFilter(value)}
								getPopupContainer={(trigger) => trigger.parentElement || document.body}
							>
								{COURSE_STATUS_OPTIONS.map((item) => (
									<Option key={item.value} value={item.value}>
										{item.label}
									</Option>
								))}
							</Select>
						</Col>

						<Col xs={24} sm={24} md={24} lg={6}>
							<Button
								block
								onClick={() => {
									setSearchText('');
									setLecturerFilter(undefined);
									setStatusFilter(undefined);
								}}
							>
								Xóa bộ lọc
							</Button>
						</Col>
					</Row>
				</div>

				<div style={{ marginBottom: 12 }}>
					<Text strong>Tổng số khóa học hiển thị: {filteredCourses.length}</Text>
				</div>

				<Table
					rowKey='id'
					columns={columns}
					dataSource={filteredCourses}
					scroll={{ x: 1200 }}
					pagination={{
						pageSize: 5,
						showSizeChanger: true,
						pageSizeOptions: ['5', '10', '20'],
						showTotal: (total) => `Tổng ${total} bản ghi`,
					}}
				/>
			</Card>

			<Modal
				visible={modalVisible}
				title={editingRecord ? 'Chỉnh sửa khóa học' : 'Thêm mới khóa học'}
				onCancel={closeModal}
				onOk={handleSubmit}
				confirmLoading={submitLoading}
				destroyOnClose
				width={720}
				okText={editingRecord ? 'Cập nhật' : 'Thêm mới'}
				cancelText='Hủy'
				maskClosable={false}
			>
				<Form form={form} layout='vertical'>
					<Form.Item
						label='Tên khóa học'
						name='name'
						rules={[
							{ required: true, message: 'Vui lòng nhập tên khóa học' },
							{ max: 100, message: 'Tên khóa học tối đa 100 ký tự' },
							{
								validator: async (_rule, value) => {
									const currentName = String(value || '')
										.trim()
										.toLowerCase();

									if (!currentName) {
										return Promise.resolve();
									}

									const isDuplicate = courses.some((item) => {
										const sameName = item.name.trim().toLowerCase() === currentName;
										const isOtherRecord = editingRecord ? item.id !== editingRecord.id : true;
										return sameName && isOtherRecord;
									});

									if (isDuplicate) {
										return Promise.reject(new Error('Tên khóa học không được trùng'));
									}

									return Promise.resolve();
								},
							},
						]}
					>
						<Input placeholder='Nhập tên khóa học' />
					</Form.Item>

					<Form.Item
						label='Giảng viên'
						name='lecturerId'
						rules={[{ required: true, message: 'Vui lòng chọn giảng viên' }]}
					>
						<Select
							placeholder='Chọn giảng viên'
							getPopupContainer={(trigger) => trigger.parentElement || document.body}
						>
							{lecturers.map((lecturer) => (
								<Option key={lecturer.id} value={lecturer.id}>
									{lecturer.name}
								</Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item
						label='Số lượng học viên'
						name='studentCount'
						rules={[
							{ required: true, message: 'Vui lòng nhập số lượng học viên' },
							{
								validator: async (_rule, value) => {
									if (value === undefined || value === null || value === '') {
										return Promise.reject(new Error('Vui lòng nhập số lượng học viên'));
									}
									if (!Number.isInteger(Number(value))) {
										return Promise.reject(new Error('Số lượng học viên phải là số nguyên'));
									}
									if (Number(value) < 0) {
										return Promise.reject(new Error('Số lượng học viên phải lớn hơn hoặc bằng 0'));
									}
									return Promise.resolve();
								},
							},
						]}
					>
						<InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder='Nhập số lượng học viên' />
					</Form.Item>

					<Form.Item
						label='Mô tả khóa học (HTML)'
						name='description'
						rules={[{ required: true, message: 'Vui lòng nhập mô tả khóa học' }]}
					>
						<TextArea rows={6} placeholder='<p>Khóa học React cơ bản</p><ul><li>JSX</li><li>Hooks</li></ul>' />
					</Form.Item>

					<Form.Item
						label='Trạng thái khóa học'
						name='status'
						rules={[{ required: true, message: 'Vui lòng chọn trạng thái khóa học' }]}
					>
						<Select
							placeholder='Chọn trạng thái'
							getPopupContainer={(trigger) => trigger.parentElement || document.body}
						>
							{COURSE_STATUS_OPTIONS.map((item) => (
								<Option key={item.value} value={item.value}>
									{item.label}
								</Option>
							))}
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default KhoaHocPage;
