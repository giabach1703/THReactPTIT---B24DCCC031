import React, { useState } from 'react';
import { Table, Button, Input, Space, Popconfirm, message } from 'antd';
import { useModel } from 'umi';
import ProductForm from './components/ProductForm';
import { Product } from '@/models/product';

const ProductManage: React.FC = () => {
	const { products, addProduct, updateProduct, deleteProduct } = useModel('product');

	const [searchText, setSearchText] = useState('');
	const [open, setOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);

	const filteredData = products.filter((p) => p.name.toLowerCase().includes(searchText.toLowerCase()));

	const columns = [
		{
			title: 'STT',
			render: (_: any, __: any, index: number) => index + 1,
		},
		{
			title: 'Tên sản phẩm',
			dataIndex: 'name',
		},
		{
			title: 'Giá',
			dataIndex: 'price',
			render: (price: number) => price.toLocaleString('vi-VN') + ' ₫',
		},
		{
			title: 'Số lượng',
			dataIndex: 'quantity',
		},
		{
			title: 'Thao tác',
			render: (_: any, record: Product) => (
				<Space>
					<Button
						type='link'
						onClick={() => {
							setEditingProduct(record);
							setOpen(true);
						}}
					>
						Sửa
					</Button>

					<Popconfirm
						title='Bạn có chắc chắn muốn xóa?'
						onConfirm={() => {
							deleteProduct(record.id);
							message.success('Xóa sản phẩm thành công');
						}}
					>
						<Button danger type='link'>
							Xóa
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<>
			<Space style={{ marginBottom: 16 }}>
				<Input.Search
					placeholder='Tìm kiếm theo tên sản phẩm'
					onChange={(e) => setSearchText(e.target.value)}
					style={{ width: 300 }}
					allowClear
				/>

				<Button
					type='primary'
					onClick={() => {
						setEditingProduct(null);
						setOpen(true);
					}}
				>
					Thêm sản phẩm
				</Button>
			</Space>

			<Table rowKey='id' columns={columns} dataSource={filteredData} />

			<ProductForm
				open={open}
				initialValues={editingProduct}
				onCancel={() => setOpen(false)}
				onSubmit={(product) => {
					if (editingProduct) {
						updateProduct(product);
						message.success('Cập nhật sản phẩm thành công');
					} else {
						addProduct(product);
						message.success('Thêm sản phẩm thành công');
					}
					setOpen(false);
				}}
			/>
		</>
	);
};

export default ProductManage;
