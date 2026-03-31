import React, { useMemo, useState } from 'react';
import { Button, Card, Form, Modal, Select, Space, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ApplicationItem } from '@/types/club';
import { clubStore } from '@/utils/clubStore';

const ClubMembersPage: React.FC = () => {
	const [reloadKey, setReloadKey] = useState(0);
	const [selectedClubId, setSelectedClubId] = useState<string | undefined>(undefined);
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [transferVisible, setTransferVisible] = useState(false);
	const [form] = Form.useForm();

	const clubs = useMemo(() => clubStore.getClubs(), [reloadKey]);

	const members = useMemo(() => {
		return clubStore.getApprovedMembersByClub(selectedClubId);
	}, [selectedClubId, reloadKey]);

	const handleReload = () => setReloadKey((prev) => prev + 1);

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
			title: 'CLB hiện tại',
			dataIndex: 'clubId',
			render: (value) => clubStore.getClubName(value),
		},
	];

	const handleTransfer = async () => {
		const values = await form.validateFields();
		clubStore.transferMembers(selectedRowKeys as string[], values.newClubId);
		message.success(`Đã chuyển ${selectedRowKeys.length} thành viên sang CLB mới`);
		setTransferVisible(false);
		setSelectedRowKeys([]);
		handleReload();
	};

	return (
		<Card
			title='Quản lý thành viên câu lạc bộ'
			extra={
				<Space wrap>
					<Select
						allowClear
						placeholder='Lọc theo câu lạc bộ'
						style={{ width: 260 }}
						value={selectedClubId}
						onChange={(value) => setSelectedClubId(value)}
					>
						{clubs.map((club) => (
							<Select.Option key={club.id} value={club.id}>
								{club.name}
							</Select.Option>
						))}
					</Select>

					<Button
						onClick={() => {
							if (!selectedRowKeys.length) {
								message.warning('Vui lòng chọn ít nhất 1 thành viên');
								return;
							}
							form.resetFields();
							setTransferVisible(true);
						}}
					>
						Đổi CLB cho {selectedRowKeys.length ? `${selectedRowKeys.length} thành viên đã chọn` : 'thành viên'}
					</Button>
				</Space>
			}
		>
			<Table
				rowKey='id'
				bordered
				dataSource={members}
				columns={columns}
				rowSelection={{
					selectedRowKeys,
					onChange: (keys) => setSelectedRowKeys(keys),
				}}
			/>

			<Modal
				title='Chuyển câu lạc bộ cho thành viên'
				visible={transferVisible}
				onCancel={() => setTransferVisible(false)}
				onOk={handleTransfer}
				destroyOnClose
			>
				<p>
					Bạn đang chuyển <b>{selectedRowKeys.length}</b> thành viên sang câu lạc bộ khác.
				</p>

				<Form form={form} layout='vertical'>
					<Form.Item
						label='Chọn CLB muốn chuyển đến'
						name='newClubId'
						rules={[{ required: true, message: 'Vui lòng chọn câu lạc bộ' }]}
					>
						<Select placeholder='Chọn câu lạc bộ'>
							{clubs.map((club) => (
								<Select.Option key={club.id} value={club.id}>
									{club.name}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</Card>
	);
};

export default ClubMembersPage;
