import React, { useMemo, useState } from 'react';
import { Button, Card, Col, Row, Space, Statistic, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

type LuaChon = 'Kéo' | 'Búa' | 'Bao';
type KetQua = 'Thắng' | 'Thua' | 'Hòa';

interface LichSuVanDau {
	id: number;
	nguoiChoi: LuaChon;
	mayTinh: LuaChon;
	ketQua: KetQua;
	thoiGian: string;
}

const dsLuaChon: { value: LuaChon; icon: string; color: string }[] = [
	{ value: 'Kéo', icon: '✌️', color: '#722ed1' },
	{ value: 'Búa', icon: '✊', color: '#fa541c' },
	{ value: 'Bao', icon: '✋', color: '#1677ff' },
];

const layIcon = (luaChon: LuaChon) => {
	return dsLuaChon.find((item) => item.value === luaChon)?.icon || '';
};

const xacDinhKetQua = (nguoiChoi: LuaChon, mayTinh: LuaChon): KetQua => {
	if (nguoiChoi === mayTinh) return 'Hòa';

	if (
		(nguoiChoi === 'Kéo' && mayTinh === 'Bao') ||
		(nguoiChoi === 'Búa' && mayTinh === 'Kéo') ||
		(nguoiChoi === 'Bao' && mayTinh === 'Búa')
	) {
		return 'Thắng';
	}

	return 'Thua';
};

const mauKetQua = (ketQua: KetQua) => {
	if (ketQua === 'Thắng') return 'green';
	if (ketQua === 'Thua') return 'red';
	return 'gold';
};

const mauNenKetQua = (ketQua: KetQua | null) => {
	if (ketQua === 'Thắng') return 'linear-gradient(135deg, #f6ffed, #d9f7be)';
	if (ketQua === 'Thua') return 'linear-gradient(135deg, #fff1f0, #ffccc7)';
	if (ketQua === 'Hòa') return 'linear-gradient(135deg, #fffbe6, #ffe58f)';
	return 'linear-gradient(135deg, #f5f5f5, #fafafa)';
};

const OanTuTi: React.FC = () => {
	const [lichSu, setLichSu] = useState<LichSuVanDau[]>([]);
	const [luaChonNguoiChoi, setLuaChonNguoiChoi] = useState<LuaChon | null>(null);
	const [luaChonMayTinh, setLuaChonMayTinh] = useState<LuaChon | null>(null);
	const [ketQuaHienTai, setKetQuaHienTai] = useState<KetQua | null>(null);

	const choiVanMoi = (luaChon: LuaChon) => {
		const danhSach = dsLuaChon.map((item) => item.value);
		const mayTinh = danhSach[Math.floor(Math.random() * danhSach.length)];
		const ketQua = xacDinhKetQua(luaChon, mayTinh);

		const banGhiMoi: LichSuVanDau = {
			id: Date.now(),
			nguoiChoi: luaChon,
			mayTinh,
			ketQua,
			thoiGian: new Date().toLocaleString('vi-VN'),
		};

		setLuaChonNguoiChoi(luaChon);
		setLuaChonMayTinh(mayTinh);
		setKetQuaHienTai(ketQua);
		setLichSu((prev) => [banGhiMoi, ...prev]);

		message.success(`Bạn ${ketQua.toLowerCase()} ở ván này`);
	};

	const xoaLichSu = () => {
		setLichSu([]);
		setLuaChonNguoiChoi(null);
		setLuaChonMayTinh(null);
		setKetQuaHienTai(null);
		message.success('Đã xóa lịch sử');
	};

	const thongKe = useMemo(() => {
		return {
			tongSoVan: lichSu.length,
			soVanThang: lichSu.filter((item) => item.ketQua === 'Thắng').length,
			soVanThua: lichSu.filter((item) => item.ketQua === 'Thua').length,
			soVanHoa: lichSu.filter((item) => item.ketQua === 'Hòa').length,
		};
	}, [lichSu]);

	const columns: ColumnsType<LichSuVanDau> = [
		{
			title: 'STT',
			width: 70,
			render: (_, __, index) => index + 1,
		},
		{
			title: 'Người chơi',
			dataIndex: 'nguoiChoi',
			render: (value: LuaChon) => (
				<Space>
					<span style={{ fontSize: 24 }}>{layIcon(value)}</span>
					<span>{value}</span>
				</Space>
			),
		},
		{
			title: 'Máy tính',
			dataIndex: 'mayTinh',
			render: (value: LuaChon) => (
				<Space>
					<span style={{ fontSize: 24 }}>{layIcon(value)}</span>
					<span>{value}</span>
				</Space>
			),
		},
		{
			title: 'Kết quả',
			dataIndex: 'ketQua',
			render: (value: KetQua) => <Tag color={mauKetQua(value)}>{value}</Tag>,
		},
		{
			title: 'Thời gian',
			dataIndex: 'thoiGian',
		},
	];

	return (
		<div style={{ padding: 8 }}>
			<Card
				bordered={false}
				style={{
					marginBottom: 16,
					borderRadius: 20,
					background: 'linear-gradient(135deg, #e6f4ff, #f9f0ff)',
					boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
				}}
			>
				<Title level={2} style={{ marginBottom: 8 }}>
					Bài 1 - Trò chơi Oẳn Tù Tì
				</Title>
				<Text style={{ fontSize: 16 }}>
					Chọn <b>Kéo</b>, <b>Búa</b> hoặc <b>Bao</b>. Máy tính sẽ chọn ngẫu nhiên và hệ thống sẽ xác định kết quả
					thắng, thua hoặc hòa.
				</Text>
			</Card>

			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				{dsLuaChon.map((item) => (
					<Col xs={24} sm={8} key={item.value}>
						<Card
							hoverable
							onClick={() => choiVanMoi(item.value)}
							style={{
								borderRadius: 20,
								textAlign: 'center',
								cursor: 'pointer',
								border: `2px solid ${item.color}`,
								boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
							}}
							bodyStyle={{ padding: 24 }}
						>
							<div style={{ fontSize: 60, marginBottom: 12 }}>{item.icon}</div>
							<Title level={3} style={{ marginBottom: 8 }}>
								{item.value}
							</Title>
							<Button type='primary' size='large'>
								Chọn {item.value}
							</Button>
						</Card>
					</Col>
				))}
			</Row>

			<Row gutter={16} style={{ marginBottom: 16 }}>
				<Col xs={24} md={6}>
					<Card style={{ borderRadius: 16, boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
						<Statistic title='Tổng số ván' value={thongKe.tongSoVan} />
					</Card>
				</Col>
				<Col xs={24} md={6}>
					<Card style={{ borderRadius: 16, boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
						<Statistic title='Số ván thắng' value={thongKe.soVanThang} valueStyle={{ color: '#389e0d' }} />
					</Card>
				</Col>
				<Col xs={24} md={6}>
					<Card style={{ borderRadius: 16, boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
						<Statistic title='Số ván thua' value={thongKe.soVanThua} valueStyle={{ color: '#cf1322' }} />
					</Card>
				</Col>
				<Col xs={24} md={6}>
					<Card style={{ borderRadius: 16, boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
						<Statistic title='Số ván hòa' value={thongKe.soVanHoa} valueStyle={{ color: '#d48806' }} />
					</Card>
				</Col>
			</Row>

			<Card
				title='Kết quả ván hiện tại'
				extra={
					<Button danger onClick={xoaLichSu}>
						Xóa lịch sử
					</Button>
				}
				style={{
					marginBottom: 16,
					borderRadius: 20,
					background: mauNenKetQua(ketQuaHienTai),
					boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
				}}
			>
				{ketQuaHienTai ? (
					<Row gutter={16} align='middle'>
						<Col xs={24} md={8} style={{ textAlign: 'center' }}>
							<div style={{ fontSize: 64 }}>{layIcon(luaChonNguoiChoi as LuaChon)}</div>
							<Title level={4}>Người chơi</Title>
							<Text strong>{luaChonNguoiChoi}</Text>
						</Col>

						<Col xs={24} md={8} style={{ textAlign: 'center' }}>
							<Tag color={mauKetQua(ketQuaHienTai)} style={{ fontSize: 20, padding: '8px 20px', borderRadius: 999 }}>
								{ketQuaHienTai}
							</Tag>
						</Col>

						<Col xs={24} md={8} style={{ textAlign: 'center' }}>
							<div style={{ fontSize: 64 }}>{layIcon(luaChonMayTinh as LuaChon)}</div>
							<Title level={4}>Máy tính</Title>
							<Text strong>{luaChonMayTinh}</Text>
						</Col>
					</Row>
				) : (
					<div style={{ textAlign: 'center', padding: '24px 0' }}>
						<div style={{ fontSize: 56, marginBottom: 12 }}>🎮</div>
						<Text style={{ fontSize: 16 }}>Hãy chọn một biểu tượng để bắt đầu chơi.</Text>
					</div>
				)}
			</Card>

			<Card
				title='Lịch sử kết quả mỗi ván đấu'
				style={{
					borderRadius: 20,
					boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
				}}
			>
				<Table<LichSuVanDau> rowKey='id' columns={columns} dataSource={lichSu} pagination={{ pageSize: 5 }} />
			</Card>
		</div>
	);
};

export default OanTuTi;
