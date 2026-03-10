import React, { useEffect, useMemo, useState } from 'react';
import {
	Button,
	Card,
	Col,
	Divider,
	Form,
	Input,
	InputNumber,
	Popconfirm,
	Row,
	Select,
	Space,
	Statistic,
	Table,
	Tabs,
	Tag,
	Typography,
	message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

type MucDoKho = 'Dễ' | 'Trung bình' | 'Khó' | 'Rất khó';

interface KhoiKienThuc {
	id: string;
	ten: string;
}

interface MonHoc {
	maMon: string;
	tenMon: string;
	soTinChi: number;
}

interface CauHoi {
	maCauHoi: string;
	maMon: string;
	noiDung: string;
	mucDoKho: MucDoKho;
	maKhoiKienThuc: string;
}

interface DongCauTrucDe {
	id: string;
	maKhoiKienThuc: string;
	mucDoKho: MucDoKho;
	soLuong: number;
}

interface CauTrucDe {
	maCauTruc: string;
	tenCauTruc: string;
	maMon: string;
	chiTiet: DongCauTrucDe[];
}

interface DeThi {
	maDe: string;
	tenDe: string;
	maMon: string;
	maCauTruc: string;
	danhSachCauHoi: CauHoi[];
	ngayTao: string;
}

const dsMucDoKho: MucDoKho[] = ['Dễ', 'Trung bình', 'Khó', 'Rất khó'];

const STORAGE_KEYS = {
	KHOI_KIEN_THUC: 'th02_khoi_kien_thuc',
	MON_HOC: 'th02_mon_hoc',
	CAU_HOI: 'th02_cau_hoi',
	CAU_TRUC_DE: 'th02_cau_truc_de',
	DE_THI: 'th02_de_thi',
};

const duLieuMauKhoiKienThuc: KhoiKienThuc[] = [
	{ id: 'KKT01', ten: 'Tổng quan' },
	{ id: 'KKT02', ten: 'Chuyên sâu' },
];

const duLieuMauMonHoc: MonHoc[] = [
	{ maMon: 'INT1307', tenMon: 'Lập trình hướng đối tượng', soTinChi: 3 },
	{ maMon: 'WEB101', tenMon: 'Lập trình Web', soTinChi: 3 },
];

const duLieuMauCauHoi: CauHoi[] = [
	{
		maCauHoi: 'CH01',
		maMon: 'INT1307',
		noiDung: 'Trình bày khái niệm lớp và đối tượng trong Java.',
		mucDoKho: 'Dễ',
		maKhoiKienThuc: 'KKT01',
	},
	{
		maCauHoi: 'CH02',
		maMon: 'INT1307',
		noiDung: 'Phân tích tính đóng gói trong lập trình hướng đối tượng.',
		mucDoKho: 'Trung bình',
		maKhoiKienThuc: 'KKT01',
	},
	{
		maCauHoi: 'CH03',
		maMon: 'INT1307',
		noiDung: 'So sánh abstract class và interface trong Java.',
		mucDoKho: 'Khó',
		maKhoiKienThuc: 'KKT02',
	},
	{
		maCauHoi: 'CH04',
		maMon: 'INT1307',
		noiDung: 'Trình bày tính đa hình và ví dụ minh họa.',
		mucDoKho: 'Rất khó',
		maKhoiKienThuc: 'KKT02',
	},
	{
		maCauHoi: 'CH05',
		maMon: 'WEB101',
		noiDung: 'Trình bày khái niệm client-server trong ứng dụng web.',
		mucDoKho: 'Dễ',
		maKhoiKienThuc: 'KKT01',
	},
	{
		maCauHoi: 'CH06',
		maMon: 'WEB101',
		noiDung: 'Phân tích sự khác nhau giữa GET và POST.',
		mucDoKho: 'Trung bình',
		maKhoiKienThuc: 'KKT01',
	},
];

const layDuLieuLocal = <T,>(key: string, duLieuMacDinh: T): T => {
	const raw = localStorage.getItem(key);
	if (!raw) return duLieuMacDinh;
	try {
		return JSON.parse(raw) as T;
	} catch {
		return duLieuMacDinh;
	}
};

const luuDuLieuLocal = (key: string, value: unknown) => {
	localStorage.setItem(key, JSON.stringify(value));
};

const mauMucDoKho = (mucDo: MucDoKho) => {
	switch (mucDo) {
		case 'Dễ':
			return 'green';
		case 'Trung bình':
			return 'blue';
		case 'Khó':
			return 'orange';
		case 'Rất khó':
			return 'red';
		default:
			return 'default';
	}
};

const NganHangCauHoi: React.FC = () => {
	const [dsKhoiKienThuc, setDsKhoiKienThuc] = useState<KhoiKienThuc[]>([]);
	const [dsMonHoc, setDsMonHoc] = useState<MonHoc[]>([]);
	const [dsCauHoi, setDsCauHoi] = useState<CauHoi[]>([]);
	const [dsCauTrucDe, setDsCauTrucDe] = useState<CauTrucDe[]>([]);
	const [dsDeThi, setDsDeThi] = useState<DeThi[]>([]);
	const [ketQuaTimKiem, setKetQuaTimKiem] = useState<CauHoi[]>([]);
	const [dsDongCauTruc, setDsDongCauTruc] = useState<DongCauTrucDe[]>([]);
	const [deThiMoiNhat, setDeThiMoiNhat] = useState<DeThi | null>(null);

	const [formKhoi] = Form.useForm();
	const [formMon] = Form.useForm();
	const [formCauHoi] = Form.useForm();
	const [formTimKiem] = Form.useForm();
	const [formCauTruc] = Form.useForm();
	const [formDeThi] = Form.useForm();

	useEffect(() => {
		const khoiData = layDuLieuLocal<KhoiKienThuc[]>(STORAGE_KEYS.KHOI_KIEN_THUC, duLieuMauKhoiKienThuc);
		const monData = layDuLieuLocal<MonHoc[]>(STORAGE_KEYS.MON_HOC, duLieuMauMonHoc);
		const cauHoiData = layDuLieuLocal<CauHoi[]>(STORAGE_KEYS.CAU_HOI, duLieuMauCauHoi);
		const cauTrucData = layDuLieuLocal<CauTrucDe[]>(STORAGE_KEYS.CAU_TRUC_DE, []);
		const deThiData = layDuLieuLocal<DeThi[]>(STORAGE_KEYS.DE_THI, []);

		setDsKhoiKienThuc(khoiData);
		setDsMonHoc(monData);
		setDsCauHoi(cauHoiData);
		setKetQuaTimKiem(cauHoiData);
		setDsCauTrucDe(cauTrucData);
		setDsDeThi(deThiData);

		luuDuLieuLocal(STORAGE_KEYS.KHOI_KIEN_THUC, khoiData);
		luuDuLieuLocal(STORAGE_KEYS.MON_HOC, monData);
		luuDuLieuLocal(STORAGE_KEYS.CAU_HOI, cauHoiData);
		luuDuLieuLocal(STORAGE_KEYS.CAU_TRUC_DE, cauTrucData);
		luuDuLieuLocal(STORAGE_KEYS.DE_THI, deThiData);
	}, []);

	const mapKhoi = useMemo(
		() => Object.fromEntries(dsKhoiKienThuc.map((item) => [item.id, item.ten])),
		[dsKhoiKienThuc],
	);

	const mapMon = useMemo(() => Object.fromEntries(dsMonHoc.map((item) => [item.maMon, item.tenMon])), [dsMonHoc]);

	const capNhatKhoi = (data: KhoiKienThuc[]) => {
		setDsKhoiKienThuc(data);
		luuDuLieuLocal(STORAGE_KEYS.KHOI_KIEN_THUC, data);
	};

	const capNhatMon = (data: MonHoc[]) => {
		setDsMonHoc(data);
		luuDuLieuLocal(STORAGE_KEYS.MON_HOC, data);
	};

	const capNhatCauHoi = (data: CauHoi[]) => {
		setDsCauHoi(data);
		setKetQuaTimKiem(data);
		luuDuLieuLocal(STORAGE_KEYS.CAU_HOI, data);
	};

	const capNhatCauTrucDe = (data: CauTrucDe[]) => {
		setDsCauTrucDe(data);
		luuDuLieuLocal(STORAGE_KEYS.CAU_TRUC_DE, data);
	};

	const capNhatDeThi = (data: DeThi[]) => {
		setDsDeThi(data);
		luuDuLieuLocal(STORAGE_KEYS.DE_THI, data);
	};

	const themKhoiKienThuc = async () => {
		const values = await formKhoi.validateFields();
		const daTonTai = dsKhoiKienThuc.some((item) => item.id === values.id);
		if (daTonTai) {
			message.error('Mã khối kiến thức đã tồn tại');
			return;
		}
		const dataMoi = [...dsKhoiKienThuc, values];
		capNhatKhoi(dataMoi);
		formKhoi.resetFields();
		message.success('Thêm khối kiến thức thành công');
	};

	const themMonHoc = async () => {
		const values = await formMon.validateFields();
		const daTonTai = dsMonHoc.some((item) => item.maMon === values.maMon);
		if (daTonTai) {
			message.error('Mã môn học đã tồn tại');
			return;
		}
		const dataMoi = [...dsMonHoc, values];
		capNhatMon(dataMoi);
		formMon.resetFields();
		message.success('Thêm môn học thành công');
	};

	const themCauHoi = async () => {
		const values = await formCauHoi.validateFields();
		const daTonTai = dsCauHoi.some((item) => item.maCauHoi === values.maCauHoi);
		if (daTonTai) {
			message.error('Mã câu hỏi đã tồn tại');
			return;
		}
		const dataMoi = [...dsCauHoi, values];
		capNhatCauHoi(dataMoi);
		formCauHoi.resetFields();
		message.success('Thêm câu hỏi thành công');
	};

	const timKiemCauHoi = async () => {
		const values = await formTimKiem.validateFields();
		const ketQua = dsCauHoi.filter((item) => {
			const dkMon = values.maMon ? item.maMon === values.maMon : true;
			const dkKho = values.mucDoKho ? item.mucDoKho === values.mucDoKho : true;
			const dkKhoi = values.maKhoiKienThuc ? item.maKhoiKienThuc === values.maKhoiKienThuc : true;
			return dkMon && dkKho && dkKhoi;
		});
		setKetQuaTimKiem(ketQua);
		message.success(`Tìm thấy ${ketQua.length} câu hỏi`);
	};

	const datLaiTimKiem = () => {
		formTimKiem.resetFields();
		setKetQuaTimKiem(dsCauHoi);
	};

	const themDongCauTruc = () => {
		setDsDongCauTruc((prev) => [
			...prev,
			{
				id: `${Date.now()}_${prev.length + 1}`,
				maKhoiKienThuc: '',
				mucDoKho: 'Dễ',
				soLuong: 1,
			},
		]);
	};

	const capNhatDongCauTruc = (id: string, field: keyof DongCauTrucDe, value: string | number) => {
		setDsDongCauTruc((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
	};

	const xoaDongCauTruc = (id: string) => {
		setDsDongCauTruc((prev) => prev.filter((item) => item.id !== id));
	};

	const luuCauTrucDe = async () => {
		const values = await formCauTruc.validateFields();

		if (!dsDongCauTruc.length) {
			message.error('Phải có ít nhất 1 dòng cấu trúc đề');
			return;
		}

		if (dsDongCauTruc.some((item) => !item.maKhoiKienThuc || !item.mucDoKho || !item.soLuong)) {
			message.error('Vui lòng nhập đầy đủ thông tin cấu trúc đề');
			return;
		}

		const daTonTai = dsCauTrucDe.some((item) => item.maCauTruc === values.maCauTruc);
		if (daTonTai) {
			message.error('Mã cấu trúc đề đã tồn tại');
			return;
		}

		const cauTrucMoi: CauTrucDe = {
			maCauTruc: values.maCauTruc,
			tenCauTruc: values.tenCauTruc,
			maMon: values.maMon,
			chiTiet: dsDongCauTruc,
		};

		const dataMoi = [...dsCauTrucDe, cauTrucMoi];
		capNhatCauTrucDe(dataMoi);
		setDsDongCauTruc([]);
		formCauTruc.resetFields();
		message.success('Lưu cấu trúc đề thi thành công');
	};

	const taoDeThiTuDong = async () => {
		const values = await formDeThi.validateFields();
		const cauTruc = dsCauTrucDe.find((item) => item.maCauTruc === values.maCauTruc);

		if (!cauTruc) {
			message.error('Không tìm thấy cấu trúc đề');
			return;
		}

		const daTonTai = dsDeThi.some((item) => item.maDe === values.maDe);
		if (daTonTai) {
			message.error('Mã đề thi đã tồn tại');
			return;
		}

		const cauHoiDaChon: CauHoi[] = [];

		for (const dong of cauTruc.chiTiet) {
			const danhSachPhuHop = dsCauHoi.filter(
				(item) =>
					item.maMon === cauTruc.maMon &&
					item.maKhoiKienThuc === dong.maKhoiKienThuc &&
					item.mucDoKho === dong.mucDoKho &&
					!cauHoiDaChon.some((c) => c.maCauHoi === item.maCauHoi),
			);

			if (danhSachPhuHop.length < dong.soLuong) {
				message.error(
					`Không đủ câu hỏi cho khối "${mapKhoi[dong.maKhoiKienThuc] || dong.maKhoiKienThuc}" - mức "${dong.mucDoKho}"`,
				);
				return;
			}

			cauHoiDaChon.push(...danhSachPhuHop.slice(0, dong.soLuong));
		}

		const deThiMoi: DeThi = {
			maDe: values.maDe,
			tenDe: values.tenDe,
			maMon: cauTruc.maMon,
			maCauTruc: cauTruc.maCauTruc,
			danhSachCauHoi: cauHoiDaChon,
			ngayTao: new Date().toLocaleString('vi-VN'),
		};

		const dataMoi = [...dsDeThi, deThiMoi];
		capNhatDeThi(dataMoi);
		setDeThiMoiNhat(deThiMoi);
		formDeThi.resetFields();
		message.success('Tạo đề thi thành công');
	};

	const cotKhoiKienThuc: ColumnsType<KhoiKienThuc> = [
		{ title: 'Mã khối', dataIndex: 'id' },
		{ title: 'Tên khối kiến thức', dataIndex: 'ten' },
		{
			title: 'Thao tác',
			render: (_, record) => (
				<Popconfirm
					title='Bạn có chắc muốn xóa?'
					onConfirm={() => capNhatKhoi(dsKhoiKienThuc.filter((item) => item.id !== record.id))}
				>
					<Button danger size='small'>
						Xóa
					</Button>
				</Popconfirm>
			),
		},
	];

	const cotMonHoc: ColumnsType<MonHoc> = [
		{ title: 'Mã môn', dataIndex: 'maMon' },
		{ title: 'Tên môn học', dataIndex: 'tenMon' },
		{ title: 'Số tín chỉ', dataIndex: 'soTinChi' },
		{
			title: 'Thao tác',
			render: (_, record) => (
				<Popconfirm
					title='Bạn có chắc muốn xóa?'
					onConfirm={() => capNhatMon(dsMonHoc.filter((item) => item.maMon !== record.maMon))}
				>
					<Button danger size='small'>
						Xóa
					</Button>
				</Popconfirm>
			),
		},
	];

	const cotCauHoi: ColumnsType<CauHoi> = [
		{ title: 'Mã câu hỏi', dataIndex: 'maCauHoi', width: 120 },
		{
			title: 'Môn học',
			dataIndex: 'maMon',
			render: (value) => <Tag color='geekblue'>{mapMon[value] || value}</Tag>,
		},
		{ title: 'Nội dung câu hỏi', dataIndex: 'noiDung' },
		{
			title: 'Mức độ khó',
			dataIndex: 'mucDoKho',
			render: (value: MucDoKho) => <Tag color={mauMucDoKho(value)}>{value}</Tag>,
		},
		{
			title: 'Khối kiến thức',
			dataIndex: 'maKhoiKienThuc',
			render: (value) => <Tag color='purple'>{mapKhoi[value] || value}</Tag>,
		},
		{
			title: 'Thao tác',
			render: (_, record) => (
				<Popconfirm
					title='Bạn có chắc muốn xóa?'
					onConfirm={() => capNhatCauHoi(dsCauHoi.filter((item) => item.maCauHoi !== record.maCauHoi))}
				>
					<Button danger size='small'>
						Xóa
					</Button>
				</Popconfirm>
			),
		},
	];

	const cotCauTrucDe: ColumnsType<CauTrucDe> = [
		{ title: 'Mã cấu trúc', dataIndex: 'maCauTruc' },
		{ title: 'Tên cấu trúc', dataIndex: 'tenCauTruc' },
		{
			title: 'Môn học',
			dataIndex: 'maMon',
			render: (value) => mapMon[value] || value,
		},
		{
			title: 'Chi tiết',
			render: (_, record) => (
				<Space direction='vertical'>
					{record.chiTiet.map((item) => (
						<Text key={item.id}>
							- {mapKhoi[item.maKhoiKienThuc] || item.maKhoiKienThuc} | {item.mucDoKho} | Số lượng: {item.soLuong}
						</Text>
					))}
				</Space>
			),
		},
	];

	const cotDeThi: ColumnsType<DeThi> = [
		{ title: 'Mã đề', dataIndex: 'maDe' },
		{ title: 'Tên đề thi', dataIndex: 'tenDe' },
		{
			title: 'Môn học',
			dataIndex: 'maMon',
			render: (value) => mapMon[value] || value,
		},
		{ title: 'Mã cấu trúc', dataIndex: 'maCauTruc' },
		{
			title: 'Số câu',
			render: (_, record) => record.danhSachCauHoi.length,
		},
		{ title: 'Ngày tạo', dataIndex: 'ngayTao' },
	];

	const thongKe = useMemo(
		() => ({
			soKhoi: dsKhoiKienThuc.length,
			soMon: dsMonHoc.length,
			soCauHoi: dsCauHoi.length,
			soDeThi: dsDeThi.length,
		}),
		[dsKhoiKienThuc, dsMonHoc, dsCauHoi, dsDeThi],
	);

	return (
		<div style={{ padding: 8 }}>
			<Card
				bordered={false}
				style={{
					marginBottom: 16,
					borderRadius: 20,
					background: 'linear-gradient(135deg, #f6ffed, #e6f4ff)',
					boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
				}}
			>
				<Title level={2} style={{ marginBottom: 8 }}>
					Bài 2 - Hệ thống quản lý ngân hàng câu hỏi tự luận
				</Title>
				<Text style={{ fontSize: 16 }}>
					Quản lý khối kiến thức, môn học, câu hỏi tự luận, cấu trúc đề thi và sinh đề thi tự động theo yêu cầu.
				</Text>
			</Card>

			<Row gutter={16} style={{ marginBottom: 16 }}>
				<Col xs={24} md={6}>
					<Card style={{ borderRadius: 16 }}>
						<Statistic title='Khối kiến thức' value={thongKe.soKhoi} />
					</Card>
				</Col>
				<Col xs={24} md={6}>
					<Card style={{ borderRadius: 16 }}>
						<Statistic title='Môn học' value={thongKe.soMon} />
					</Card>
				</Col>
				<Col xs={24} md={6}>
					<Card style={{ borderRadius: 16 }}>
						<Statistic title='Câu hỏi' value={thongKe.soCauHoi} />
					</Card>
				</Col>
				<Col xs={24} md={6}>
					<Card style={{ borderRadius: 16 }}>
						<Statistic title='Đề thi đã lưu' value={thongKe.soDeThi} />
					</Card>
				</Col>
			</Row>

			<Card
				style={{
					borderRadius: 20,
					boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
				}}
			>
				<Tabs defaultActiveKey='1'>
					<TabPane tab='Khối kiến thức' key='1'>
						<Row gutter={16}>
							<Col xs={24} lg={8}>
								<Card title='Thêm khối kiến thức' style={{ borderRadius: 16 }}>
									<Form form={formKhoi} layout='vertical'>
										<Form.Item
											name='id'
											label='Mã khối kiến thức'
											rules={[{ required: true, message: 'Vui lòng nhập mã khối kiến thức' }]}
										>
											<Input placeholder='Ví dụ: KKT03' />
										</Form.Item>
										<Form.Item
											name='ten'
											label='Tên khối kiến thức'
											rules={[{ required: true, message: 'Vui lòng nhập tên khối kiến thức' }]}
										>
											<Input placeholder='Ví dụ: Nâng cao' />
										</Form.Item>
										<Button type='primary' onClick={themKhoiKienThuc}>
											Thêm mới
										</Button>
									</Form>
								</Card>
							</Col>

							<Col xs={24} lg={16}>
								<Card title='Danh sách khối kiến thức' style={{ borderRadius: 16 }}>
									<Table rowKey='id' columns={cotKhoiKienThuc} dataSource={dsKhoiKienThuc} />
								</Card>
							</Col>
						</Row>
					</TabPane>

					<TabPane tab='Môn học' key='2'>
						<Row gutter={16}>
							<Col xs={24} lg={8}>
								<Card title='Thêm môn học' style={{ borderRadius: 16 }}>
									<Form form={formMon} layout='vertical'>
										<Form.Item
											name='maMon'
											label='Mã môn'
											rules={[{ required: true, message: 'Vui lòng nhập mã môn' }]}
										>
											<Input placeholder='Ví dụ: INT1307' />
										</Form.Item>
										<Form.Item
											name='tenMon'
											label='Tên môn học'
											rules={[{ required: true, message: 'Vui lòng nhập tên môn học' }]}
										>
											<Input placeholder='Ví dụ: Lập trình hướng đối tượng' />
										</Form.Item>
										<Form.Item
											name='soTinChi'
											label='Số tín chỉ'
											rules={[{ required: true, message: 'Vui lòng nhập số tín chỉ' }]}
										>
											<InputNumber min={1} style={{ width: '100%' }} />
										</Form.Item>
										<Button type='primary' onClick={themMonHoc}>
											Thêm mới
										</Button>
									</Form>
								</Card>
							</Col>

							<Col xs={24} lg={16}>
								<Card title='Danh sách môn học' style={{ borderRadius: 16 }}>
									<Table rowKey='maMon' columns={cotMonHoc} dataSource={dsMonHoc} />
								</Card>
							</Col>
						</Row>
					</TabPane>

					<TabPane tab='Câu hỏi' key='3'>
						<Space direction='vertical' size='large' style={{ width: '100%' }}>
							<Row gutter={16}>
								<Col xs={24} lg={10}>
									<Card title='Thêm câu hỏi tự luận' style={{ borderRadius: 16 }}>
										<Form form={formCauHoi} layout='vertical'>
											<Form.Item
												name='maCauHoi'
												label='Mã câu hỏi'
												rules={[{ required: true, message: 'Vui lòng nhập mã câu hỏi' }]}
											>
												<Input placeholder='Ví dụ: CH07' />
											</Form.Item>

											<Form.Item
												name='maMon'
												label='Môn học'
												rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
											>
												<Select placeholder='Chọn môn học'>
													{dsMonHoc.map((item) => (
														<Option key={item.maMon} value={item.maMon}>
															{item.tenMon}
														</Option>
													))}
												</Select>
											</Form.Item>

											<Form.Item
												name='noiDung'
												label='Nội dung câu hỏi'
												rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
											>
												<Input.TextArea rows={4} placeholder='Nhập nội dung câu hỏi tự luận...' />
											</Form.Item>

											<Form.Item
												name='mucDoKho'
												label='Mức độ khó'
												rules={[{ required: true, message: 'Vui lòng chọn mức độ khó' }]}
											>
												<Select placeholder='Chọn mức độ khó'>
													{dsMucDoKho.map((item) => (
														<Option key={item} value={item}>
															{item}
														</Option>
													))}
												</Select>
											</Form.Item>

											<Form.Item
												name='maKhoiKienThuc'
												label='Khối kiến thức'
												rules={[{ required: true, message: 'Vui lòng chọn khối kiến thức' }]}
											>
												<Select placeholder='Chọn khối kiến thức'>
													{dsKhoiKienThuc.map((item) => (
														<Option key={item.id} value={item.id}>
															{item.ten}
														</Option>
													))}
												</Select>
											</Form.Item>

											<Button type='primary' onClick={themCauHoi}>
												Thêm câu hỏi
											</Button>
										</Form>
									</Card>
								</Col>

								<Col xs={24} lg={14}>
									<Card title='Tìm kiếm câu hỏi' style={{ borderRadius: 16 }}>
										<Form form={formTimKiem} layout='vertical'>
											<Row gutter={16}>
												<Col xs={24} md={8}>
													<Form.Item name='maMon' label='Môn học'>
														<Select allowClear placeholder='Tất cả'>
															{dsMonHoc.map((item) => (
																<Option key={item.maMon} value={item.maMon}>
																	{item.tenMon}
																</Option>
															))}
														</Select>
													</Form.Item>
												</Col>

												<Col xs={24} md={8}>
													<Form.Item name='mucDoKho' label='Mức độ khó'>
														<Select allowClear placeholder='Tất cả'>
															{dsMucDoKho.map((item) => (
																<Option key={item} value={item}>
																	{item}
																</Option>
															))}
														</Select>
													</Form.Item>
												</Col>

												<Col xs={24} md={8}>
													<Form.Item name='maKhoiKienThuc' label='Khối kiến thức'>
														<Select allowClear placeholder='Tất cả'>
															{dsKhoiKienThuc.map((item) => (
																<Option key={item.id} value={item.id}>
																	{item.ten}
																</Option>
															))}
														</Select>
													</Form.Item>
												</Col>
											</Row>

											<Space>
												<Button type='primary' onClick={timKiemCauHoi}>
													Tìm kiếm
												</Button>
												<Button onClick={datLaiTimKiem}>Đặt lại</Button>
											</Space>
										</Form>
									</Card>
								</Col>
							</Row>

							<Card title='Danh sách câu hỏi' style={{ borderRadius: 16 }}>
								<Table rowKey='maCauHoi' columns={cotCauHoi} dataSource={ketQuaTimKiem} />
							</Card>
						</Space>
					</TabPane>

					<TabPane tab='Đề thi' key='4'>
						<Space direction='vertical' size='large' style={{ width: '100%' }}>
							<Row gutter={16}>
								<Col xs={24} lg={12}>
									<Card title='Lưu cấu trúc đề thi' style={{ borderRadius: 16 }}>
										<Form form={formCauTruc} layout='vertical'>
											<Form.Item
												name='maCauTruc'
												label='Mã cấu trúc đề'
												rules={[{ required: true, message: 'Vui lòng nhập mã cấu trúc đề' }]}
											>
												<Input placeholder='Ví dụ: CTD01' />
											</Form.Item>

											<Form.Item
												name='tenCauTruc'
												label='Tên cấu trúc đề'
												rules={[{ required: true, message: 'Vui lòng nhập tên cấu trúc đề' }]}
											>
												<Input placeholder='Ví dụ: Đề giữa kỳ OOP' />
											</Form.Item>

											<Form.Item
												name='maMon'
												label='Môn học'
												rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
											>
												<Select placeholder='Chọn môn học'>
													{dsMonHoc.map((item) => (
														<Option key={item.maMon} value={item.maMon}>
															{item.tenMon}
														</Option>
													))}
												</Select>
											</Form.Item>
										</Form>

										<Divider />

										<Space style={{ marginBottom: 16 }}>
											<Button onClick={themDongCauTruc}>Thêm dòng cấu trúc</Button>
										</Space>

										<Space direction='vertical' style={{ width: '100%' }}>
											{dsDongCauTruc.map((item, index) => (
												<Card
													key={item.id}
													size='small'
													title={`Dòng cấu trúc ${index + 1}`}
													style={{ borderRadius: 12 }}
												>
													<Row gutter={12}>
														<Col xs={24} md={8}>
															<Text>Khối kiến thức</Text>
															<Select
																style={{ width: '100%' }}
																value={item.maKhoiKienThuc || undefined}
																onChange={(value) => capNhatDongCauTruc(item.id, 'maKhoiKienThuc', value)}
															>
																{dsKhoiKienThuc.map((k) => (
																	<Option key={k.id} value={k.id}>
																		{k.ten}
																	</Option>
																))}
															</Select>
														</Col>

														<Col xs={24} md={7}>
															<Text>Mức độ khó</Text>
															<Select
																style={{ width: '100%' }}
																value={item.mucDoKho}
																onChange={(value) => capNhatDongCauTruc(item.id, 'mucDoKho', value)}
															>
																{dsMucDoKho.map((m) => (
																	<Option key={m} value={m}>
																		{m}
																	</Option>
																))}
															</Select>
														</Col>

														<Col xs={24} md={5}>
															<Text>Số lượng</Text>
															<InputNumber
																min={1}
																style={{ width: '100%' }}
																value={item.soLuong}
																onChange={(value) => capNhatDongCauTruc(item.id, 'soLuong', value || 1)}
															/>
														</Col>

														<Col xs={24} md={4}>
															<Text>&nbsp;</Text>
															<Button danger block onClick={() => xoaDongCauTruc(item.id)}>
																Xóa
															</Button>
														</Col>
													</Row>
												</Card>
											))}
										</Space>

										<Divider />
										<Button type='primary' onClick={luuCauTrucDe}>
											Lưu cấu trúc đề
										</Button>
									</Card>
								</Col>

								<Col xs={24} lg={12}>
									<Card title='Tạo đề thi tự động' style={{ borderRadius: 16 }}>
										<Form form={formDeThi} layout='vertical'>
											<Form.Item
												name='maDe'
												label='Mã đề thi'
												rules={[{ required: true, message: 'Vui lòng nhập mã đề thi' }]}
											>
												<Input placeholder='Ví dụ: DE01' />
											</Form.Item>

											<Form.Item
												name='tenDe'
												label='Tên đề thi'
												rules={[{ required: true, message: 'Vui lòng nhập tên đề thi' }]}
											>
												<Input placeholder='Ví dụ: Đề thi giữa kỳ' />
											</Form.Item>

											<Form.Item
												name='maCauTruc'
												label='Chọn cấu trúc đề'
												rules={[{ required: true, message: 'Vui lòng chọn cấu trúc đề' }]}
											>
												<Select placeholder='Chọn cấu trúc đề'>
													{dsCauTrucDe.map((item) => (
														<Option key={item.maCauTruc} value={item.maCauTruc}>
															{item.tenCauTruc} - {mapMon[item.maMon] || item.maMon}
														</Option>
													))}
												</Select>
											</Form.Item>

											<Button type='primary' onClick={taoDeThiTuDong}>
												Tạo đề thi
											</Button>
										</Form>

										<Divider />

										<Title level={5}>Đề thi vừa tạo</Title>
										{deThiMoiNhat ? (
											<div>
												<p>
													<b>Mã đề:</b> {deThiMoiNhat.maDe}
												</p>
												<p>
													<b>Tên đề:</b> {deThiMoiNhat.tenDe}
												</p>
												<p>
													<b>Môn học:</b> {mapMon[deThiMoiNhat.maMon] || deThiMoiNhat.maMon}
												</p>
												<p>
													<b>Số câu hỏi:</b> {deThiMoiNhat.danhSachCauHoi.length}
												</p>
												<Divider />
												<Space direction='vertical' style={{ width: '100%' }}>
													{deThiMoiNhat.danhSachCauHoi.map((item, index) => (
														<Card key={item.maCauHoi} size='small' style={{ borderRadius: 12 }}>
															<Text strong>
																Câu {index + 1}: [{item.maCauHoi}]
															</Text>
															<br />
															<Text>{item.noiDung}</Text>
															<br />
															<Space style={{ marginTop: 8 }}>
																<Tag color={mauMucDoKho(item.mucDoKho)}>{item.mucDoKho}</Tag>
																<Tag color='purple'>{mapKhoi[item.maKhoiKienThuc] || item.maKhoiKienThuc}</Tag>
															</Space>
														</Card>
													))}
												</Space>
											</div>
										) : (
											<Text>Chưa có đề thi nào vừa được tạo.</Text>
										)}
									</Card>
								</Col>
							</Row>

							<Card title='Danh sách cấu trúc đề thi' style={{ borderRadius: 16 }}>
								<Table rowKey='maCauTruc' columns={cotCauTrucDe} dataSource={dsCauTrucDe} />
							</Card>

							<Card title='Danh sách đề thi đã lưu' style={{ borderRadius: 16 }}>
								<Table rowKey='maDe' columns={cotDeThi} dataSource={dsDeThi} />
							</Card>
						</Space>
					</TabPane>
				</Tabs>
			</Card>
		</div>
	);
};

export default NganHangCauHoi;
