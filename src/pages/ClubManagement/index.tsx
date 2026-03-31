import React, { useMemo, useState } from 'react';
import {
	Button,
	Card,
	DatePicker,
	Form,
	Image,
	Input,
	Modal,
	Popconfirm,
	Space,
	Switch,
	Table,
	Tag,
	Typography,
	message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { ClubItem } from '@/types/club';
import { clubStore } from '@/utils/clubStore';

const { Text } = Typography;
const { Search, TextArea } = Input;

const ClubManagementPage: React.FC = () => {
	const [form] = Form.useForm();
	const [keyword, setKeyword] = useState('');
	const [visible, setVisible] = useState(false);
	const [memberVisible, setMemberVisible] = useState(false);
	const [editingItem, setEditingItem] = useState<ClubItem | null>(null);
	const [selectedClub, setSelectedClub] = useState<ClubItem | null>(null);
	const [reloadKey, setReloadKey] = useState(0);

	const clubs = useMemo(() => clubStore.getClubs(), [reloadKey]);
	const approvedMembers = useMemo(() => {
		if (!selectedClub) return [];
		return clubStore.getApprovedMembersByClub(selectedClub.id);
	}, [selectedClub, reloadKey]);

	const filteredData = useMemo(() => {
		const lower = keyword.trim().toLowerCase();
		if (!lower) return clubs;
		return clubs.filter((item) =>
			[item.name, item.president, item.foundedDate].some((field) => String(field).toLowerCase().includes(lower)),
		);
	}, [clubs, keyword]);

	const handleReload = () => setReloadKey((prev) => prev + 1);

	const openCreate = () => {
		setEditingItem(null);
		form.resetFields();
		form.setFieldsValue({
			isActive: true,
			foundedDate: dayjs(),
			avatar: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=400&auto=format&fit=crop',
			description: '<p>Mô tả câu lạc bộ...</p>',
		});
		setVisible(true);
	};

	const openEdit = (record: ClubItem) => {
		setEditingItem(record);
		form.setFieldsValue({
			...record,
			foundedDate: dayjs(record.foundedDate),
		});
		setVisible(true);
	};

	const handleSubmit = async () => {
		const values = await form.validateFields();

		const payload = {
			avatar: values.avatar,
			name: values.name,
			foundedDate: values.foundedDate.format('YYYY-MM-DD'),
			description: values.description,
			president: values.president,
			isActive: values.isActive,
		};

		if (editingItem) {
			clubStore.updateClub(editingItem.id, payload);
			message.success('Cập nhật câu lạc bộ thành công');
		} else {
			clubStore.createClub(payload);
			message.success('Thêm mới câu lạc bộ thành công');
		}

		setVisible(false);
		handleReload();
	};

	const columns: ColumnsType<ClubItem> = [
		{
			title: 'Ảnh đại diện',
			dataIndex: 'avatar',
			width: 110,
			render: (value) => <Image width={64} height={64} src={value} style={{ objectFit: 'cover', borderRadius: 8 }} />,
		},
		{
			title: 'Tên câu lạc bộ',
			dataIndex: 'name',
			sorter: (a, b) => a.name.localeCompare(b.name),
			render: (_, record) => (
				<Space direction='vertical' size={0}>
					<Text strong>{record.name}</Text>
					<Text type='secondary'>CN CLB: {record.president}</Text>
				</Space>
			),
		},
		{
			title: 'Ngày thành lập',
			dataIndex: 'foundedDate',
			sorter: (a, b) => dayjs(a.foundedDate).valueOf() - dayjs(b.foundedDate).valueOf(),
			render: (value) => dayjs(value).format('DD/MM/YYYY'),
			width: 140,
		},
		{
			title: 'Mô tả',
			dataIndex: 'description',
			render: (value) => <div style={{ maxWidth: 280 }} dangerouslySetInnerHTML={{ __html: value }} />,
		},
		{
			title: 'Hoạt động',
			dataIndex: 'isActive',
			width: 120,
			filters: [
				{ text: 'Có', value: true },
				{ text: 'Không', value: false },
			],
			onFilter: (value, record) => record.isActive === value,
			render: (value) => (value ? <Tag color='green'>Có</Tag> : <Tag color='red'>Không</Tag>),
		},
		{
			title: 'Thao tác',
			width: 250,
			render: (_, record) => (
				<Space wrap>
					<Button
						type='link'
						onClick={() => {
							setSelectedClub(record);
							setMemberVisible(true);
						}}
					>
						Thành viên
					</Button>

					<Button type='link' onClick={() => openEdit(record)}>
						Chỉnh sửa
					</Button>

					<Popconfirm
						title='Bạn có chắc chắn muốn xóa câu lạc bộ này không?'
						onConfirm={() => {
							clubStore.deleteClub(record.id);
							message.success('Đã xóa câu lạc bộ');
							handleReload();
						}}
						okText='Xóa'
						cancelText='Hủy'
					>
						<Button type='link' danger>
							Xóa
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<Card
			title='Quản lý câu lạc bộ'
			extra={
				<Space>
					<Search
						allowClear
						placeholder='Tìm theo tên CLB / chủ nhiệm / ngày thành lập'
						onSearch={setKeyword}
						onChange={(e) => setKeyword(e.target.value)}
						style={{ width: 320 }}
					/>
					<Button type='primary' onClick={openCreate}>
						Thêm câu lạc bộ
					</Button>
				</Space>
			}
		>
			<Table rowKey='id' columns={columns} dataSource={filteredData} bordered />

			<Modal
				title={editingItem ? 'Chỉnh sửa câu lạc bộ' : 'Thêm mới câu lạc bộ'}
				visible={visible}
				onCancel={() => setVisible(false)}
				onOk={handleSubmit}
				width={820}
				destroyOnClose
			>
				<Form form={form} layout='vertical'>
					<Form.Item
						label='Tên câu lạc bộ'
						name='name'
						rules={[{ required: true, message: 'Vui lòng nhập tên câu lạc bộ' }]}
					>
						<Input placeholder='Nhập tên câu lạc bộ' />
					</Form.Item>

					<Form.Item
						label='Ảnh đại diện (URL)'
						name='avatar'
						rules={[{ required: true, message: 'Vui lòng nhập URL ảnh' }]}
					>
						<Input placeholder='https://...' />
					</Form.Item>

					<Form.Item
						label='Ngày thành lập'
						name='foundedDate'
						rules={[{ required: true, message: 'Vui lòng chọn ngày thành lập' }]}
					>
						<DatePicker style={{ width: '100%' }} format='DD/MM/YYYY' />
					</Form.Item>

					<Form.Item
						label='Chủ nhiệm CLB'
						name='president'
						rules={[{ required: true, message: 'Vui lòng nhập chủ nhiệm CLB' }]}
					>
						<Input placeholder='Nhập tên chủ nhiệm' />
					</Form.Item>

					<Form.Item
						label='Mô tả (HTML)'
						name='description'
						rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
					>
						<TextArea rows={6} placeholder='<p>Mô tả câu lạc bộ...</p>' />
					</Form.Item>

					<Form.Item label='Hoạt động' name='isActive' valuePropName='checked'>
						<Switch checkedChildren='Có' unCheckedChildren='Không' />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title={`Danh sách thành viên - ${selectedClub?.name || ''}`}
				visible={memberVisible}
				footer={null}
				onCancel={() => setMemberVisible(false)}
				width={900}
			>
				<Table
					rowKey='id'
					bordered
					dataSource={approvedMembers}
					pagination={false}
					columns={[
						{ title: 'Họ tên', dataIndex: 'fullName' },
						{ title: 'Email', dataIndex: 'email' },
						{ title: 'SĐT', dataIndex: 'phone' },
						{ title: 'Giới tính', dataIndex: 'gender' },
						{ title: 'Địa chỉ', dataIndex: 'address' },
						{ title: 'Sở trường', dataIndex: 'talent' },
					]}
				/>
			</Modal>
		</Card>
	);
};

export default ClubManagementPage;
