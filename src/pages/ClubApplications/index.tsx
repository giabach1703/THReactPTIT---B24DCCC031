import React, { useMemo, useState } from 'react';
import {
	Button,
	Card,
	Descriptions,
	Drawer,
	Form,
	Input,
	Modal,
	Popconfirm,
	Select,
	Space,
	Table,
	Tag,
	message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ApplicationItem } from '@/types/club';
import { clubStore } from '@/utils/clubStore';
import dayjs from 'dayjs';

const { TextArea, Search } = Input;

const ClubApplicationsPage: React.FC = () => {
	const [form] = Form.useForm();
	const [rejectForm] = Form.useForm();

	const [reloadKey, setReloadKey] = useState(0);
	const [keyword, setKeyword] = useState('');
	const [visible, setVisible] = useState(false);
	const [detailVisible, setDetailVisible] = useState(false);
	const [historyVisible, setHistoryVisible] = useState(false);
	const [rejectVisible, setRejectVisible] = useState(false);

	const [editingItem, setEditingItem] = useState<ApplicationItem | null>(null);
	const [detailItem, setDetailItem] = useState<ApplicationItem | null>(null);
	const [historyItem, setHistoryItem] = useState<ApplicationItem | null>(null);
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

	const clubs = useMemo(() => clubStore.getClubs(), [reloadKey]);
	const applications = useMemo(() => clubStore.getApplications(), [reloadKey]);
	const histories = useMemo(() => {
		if (!historyItem) return [];
		return clubStore.getApplicationHistories(historyItem.id);
	}, [historyItem, reloadKey]);

	const handleReload = () => setReloadKey((prev) => prev + 1);

	const filteredData = useMemo(() => {
		const lower = keyword.trim().toLowerCase();
		if (!lower) return applications;
		return applications.filter((item) =>
			[item.fullName, item.email, item.phone, item.address, item.talent, clubStore.getClubName(item.clubId)].some(
				(field) => String(field).toLowerCase().includes(lower),
			),
		);
	}, [applications, keyword]);

	const openCreate = () => {
		setEditingItem(null);
		form.resetFields();
		form.setFieldsValue({
			gender: 'male',
			status: 'Pending',
			clubId: clubs[0]?.id,
		});
		setVisible(true);
	};

	const openEdit = (record: ApplicationItem) => {
		setEditingItem(record);
		form.setFieldsValue(record);
		setVisible(true);
	};

	const handleSubmit = async () => {
		const values = await form.validateFields();

		const payload = {
			fullName: values.fullName,
			email: values.email,
			phone: values.phone,
			gender: values.gender,
			address: values.address,
			talent: values.talent,
			clubId: values.clubId,
			reason: values.reason,
			status: values.status,
			rejectNote: values.rejectNote || '',
		};

		if (editingItem) {
			clubStore.updateApplication(editingItem.id, payload);
			message.success('Cập nhật đơn đăng ký thành công');
		} else {
			clubStore.createApplication(payload);
			message.success('Thêm đơn đăng ký thành công');
		}

		setVisible(false);
		handleReload();
	};

	const rowSelection = {
		selectedRowKeys,
		onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
	};

	const approveSelected = () => {
		if (!selectedRowKeys.length) {
			message.warning('Vui lòng chọn ít nhất 1 đơn');
			return;
		}
		clubStore.approveApplications(selectedRowKeys as string[]);
		message.success(`Đã duyệt ${selectedRowKeys.length} đơn`);
		setSelectedRowKeys([]);
		handleReload();
	};

	const openRejectSelected = () => {
		if (!selectedRowKeys.length) {
			message.warning('Vui lòng chọn ít nhất 1 đơn');
			return;
		}
		rejectForm.resetFields();
		setRejectVisible(true);
	};

	const handleRejectSelected = async () => {
		const values = await rejectForm.validateFields();
		clubStore.rejectApplications(selectedRowKeys as string[], values.rejectNote);
		message.success(`Đã từ chối ${selectedRowKeys.length} đơn`);
		setRejectVisible(false);
		setSelectedRowKeys([]);
		handleReload();
	};

	const columns: ColumnsType<ApplicationItem> = [
		{
			title: 'Họ tên',
			dataIndex: 'fullName',
			sorter: (a, b) => a.fullName.localeCompare(b.fullName),
		},
		{
			title: 'Email',
			dataIndex: 'email',
		},
		{
			title: 'SĐT',
			dataIndex: 'phone',
		},
		{
			title: 'Giới tính',
			dataIndex: 'gender',
			width: 110,
			render: (value) => {
				if (value === 'male') return 'Nam';
				if (value === 'female') return 'Nữ';
				return 'Khác';
			},
		},
		{
			title: 'Địa chỉ',
			dataIndex: 'address',
		},
		{
			title: 'Sở trường',
			dataIndex: 'talent',
		},
		{
			title: 'Câu lạc bộ',
			dataIndex: 'clubId',
			render: (value) => clubStore.getClubName(value),
			filters: clubs.map((club) => ({ text: club.name, value: club.id })),
			onFilter: (value, record) => record.clubId === value,
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			width: 120,
			filters: [
				{ text: 'Pending', value: 'Pending' },
				{ text: 'Approved', value: 'Approved' },
				{ text: 'Rejected', value: 'Rejected' },
			],
			onFilter: (value, record) => record.status === value,
			render: (value) => {
				if (value === 'Approved') return <Tag color='green'>Approved</Tag>;
				if (value === 'Rejected') return <Tag color='red'>Rejected</Tag>;
				return <Tag color='orange'>Pending</Tag>;
			},
		},
		{
			title: 'Thao tác',
			width: 360,
			render: (_, record) => (
				<Space wrap>
					<Button
						type='link'
						onClick={() => {
							setDetailItem(record);
							setDetailVisible(true);
						}}
					>
						Chi tiết
					</Button>

					<Button type='link' onClick={() => openEdit(record)}>
						Chỉnh sửa
					</Button>

					<Button
						type='link'
						onClick={() => {
							setHistoryItem(record);
							setHistoryVisible(true);
						}}
					>
						Lịch sử
					</Button>

					<Button
						type='link'
						onClick={() => {
							clubStore.approveApplications([record.id]);
							message.success('Đã duyệt đơn');
							handleReload();
						}}
					>
						Duyệt
					</Button>

					<Button
						type='link'
						danger
						onClick={() => {
							setSelectedRowKeys([record.id]);
							rejectForm.resetFields();
							setRejectVisible(true);
						}}
					>
						Từ chối
					</Button>

					<Popconfirm
						title='Bạn có chắc chắn muốn xóa đơn đăng ký này không?'
						onConfirm={() => {
							clubStore.deleteApplication(record.id);
							message.success('Đã xóa đơn đăng ký');
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
			title='Quản lý đơn đăng ký thành viên'
			extra={
				<Space wrap>
					<Search
						allowClear
						placeholder='Tìm theo họ tên / email / CLB...'
						style={{ width: 320 }}
						value={keyword}
						onChange={(e) => setKeyword(e.target.value)}
						onSearch={setKeyword}
					/>

					<Button onClick={approveSelected}>
						Duyệt {selectedRowKeys.length ? `${selectedRowKeys.length} đơn đã chọn` : ''}
					</Button>

					<Button danger onClick={openRejectSelected}>
						Không duyệt {selectedRowKeys.length ? `${selectedRowKeys.length} đơn đã chọn` : ''}
					</Button>

					<Button type='primary' onClick={openCreate}>
						Thêm đơn đăng ký
					</Button>
				</Space>
			}
		>
			<Table rowKey='id' columns={columns} dataSource={filteredData} bordered rowSelection={rowSelection} />

			<Modal
				title={editingItem ? 'Chỉnh sửa đơn đăng ký' : 'Thêm mới đơn đăng ký'}
				visible={visible}
				onCancel={() => setVisible(false)}
				onOk={handleSubmit}
				width={900}
				destroyOnClose
			>
				<Form form={form} layout='vertical'>
					<Form.Item label='Họ tên' name='fullName' rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
						<Input />
					</Form.Item>

					<Form.Item
						label='Email'
						name='email'
						rules={[
							{ required: true, message: 'Vui lòng nhập email' },
							{ type: 'email', message: 'Email không hợp lệ' },
						]}
					>
						<Input />
					</Form.Item>

					<Form.Item label='SĐT' name='phone' rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
						<Input />
					</Form.Item>

					<Form.Item label='Giới tính' name='gender' rules={[{ required: true }]}>
						<Select>
							<Select.Option value='male'>Nam</Select.Option>
							<Select.Option value='female'>Nữ</Select.Option>
							<Select.Option value='other'>Khác</Select.Option>
						</Select>
					</Form.Item>

					<Form.Item label='Địa chỉ' name='address' rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
						<Input />
					</Form.Item>

					<Form.Item label='Sở trường' name='talent' rules={[{ required: true, message: 'Vui lòng nhập sở trường' }]}>
						<Input />
					</Form.Item>

					<Form.Item label='Câu lạc bộ' name='clubId' rules={[{ required: true, message: 'Vui lòng chọn câu lạc bộ' }]}>
						<Select>
							{clubs.map((club) => (
								<Select.Option key={club.id} value={club.id}>
									{club.name}
								</Select.Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item
						label='Lý do đăng ký'
						name='reason'
						rules={[{ required: true, message: 'Vui lòng nhập lý do đăng ký' }]}
					>
						<TextArea rows={4} />
					</Form.Item>

					<Form.Item label='Trạng thái' name='status' rules={[{ required: true }]}>
						<Select>
							<Select.Option value='Pending'>Pending</Select.Option>
							<Select.Option value='Approved'>Approved</Select.Option>
							<Select.Option value='Rejected'>Rejected</Select.Option>
						</Select>
					</Form.Item>

					<Form.Item label='Ghi chú từ chối' name='rejectNote'>
						<TextArea rows={3} />
					</Form.Item>
				</Form>
			</Modal>

			<Drawer title='Chi tiết đơn đăng ký' visible={detailVisible} width={720} onClose={() => setDetailVisible(false)}>
				{detailItem && (
					<Descriptions bordered column={1}>
						<Descriptions.Item label='Họ tên'>{detailItem.fullName}</Descriptions.Item>
						<Descriptions.Item label='Email'>{detailItem.email}</Descriptions.Item>
						<Descriptions.Item label='SĐT'>{detailItem.phone}</Descriptions.Item>
						<Descriptions.Item label='Giới tính'>
							{detailItem.gender === 'male' ? 'Nam' : detailItem.gender === 'female' ? 'Nữ' : 'Khác'}
						</Descriptions.Item>
						<Descriptions.Item label='Địa chỉ'>{detailItem.address}</Descriptions.Item>
						<Descriptions.Item label='Sở trường'>{detailItem.talent}</Descriptions.Item>
						<Descriptions.Item label='Câu lạc bộ'>{clubStore.getClubName(detailItem.clubId)}</Descriptions.Item>
						<Descriptions.Item label='Lý do đăng ký'>{detailItem.reason}</Descriptions.Item>
						<Descriptions.Item label='Trạng thái'>{detailItem.status}</Descriptions.Item>
						<Descriptions.Item label='Ghi chú từ chối'>{detailItem.rejectNote || '---'}</Descriptions.Item>
						<Descriptions.Item label='Cập nhật lần cuối'>
							{dayjs(detailItem.updatedAt).format('HH:mm DD/MM/YYYY')}
						</Descriptions.Item>
					</Descriptions>
				)}
			</Drawer>

			<Drawer
				title={`Lịch sử thao tác - ${historyItem?.fullName || ''}`}
				visible={historyVisible}
				width={720}
				onClose={() => setHistoryVisible(false)}
			>
				<Table
					rowKey='id'
					dataSource={histories}
					bordered
					pagination={false}
					columns={[
						{
							title: 'Hành động',
							dataIndex: 'action',
						},
						{
							title: 'Ghi chú',
							dataIndex: 'note',
							render: (value) => value || '---',
						},
						{
							title: 'Người thực hiện',
							dataIndex: 'by',
						},
						{
							title: 'Thời gian',
							dataIndex: 'createdAt',
							render: (value) => dayjs(value).format('HH:mm DD/MM/YYYY'),
						},
					]}
				/>
			</Drawer>

			<Modal
				title='Nhập lý do từ chối'
				visible={rejectVisible}
				onCancel={() => setRejectVisible(false)}
				onOk={handleRejectSelected}
				destroyOnClose
			>
				<Form form={rejectForm} layout='vertical'>
					<Form.Item
						label='Lý do từ chối'
						name='rejectNote'
						rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối' }]}
					>
						<TextArea rows={4} placeholder='Bắt buộc nhập lý do từ chối...' />
					</Form.Item>
				</Form>
			</Modal>
		</Card>
	);
};

export default ClubApplicationsPage;
