import React from 'react';

export type SimpleBarItem = {
	label: string;
	value: number;
};

type Props = {
	title?: string;
	data: SimpleBarItem[];
	color?: string;
};

const SimpleBarChart = ({ title, data, color = '#1677ff' }: Props) => {
	const max = Math.max(...data.map((item) => item.value), 1);

	return (
		<div>
			{title ? <div style={{ fontWeight: 600, marginBottom: 16 }}>{title}</div> : null}

			{data.length === 0 ? (
				<div
					style={{
						padding: 16,
						border: '1px dashed #d9d9d9',
						borderRadius: 12,
						color: '#888',
					}}
				>
					Chưa có dữ liệu
				</div>
			) : (
				data.map((item) => {
					const percent = Math.round((item.value / max) * 100);

					return (
						<div key={item.label} style={{ marginBottom: 14 }}>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									marginBottom: 6,
									gap: 12,
								}}
							>
								<span>{item.label}</span>
								<span style={{ fontWeight: 600 }}>{item.value.toLocaleString('vi-VN')}</span>
							</div>

							<div
								style={{
									width: '100%',
									height: 10,
									background: '#f0f0f0',
									borderRadius: 999,
									overflow: 'hidden',
								}}
							>
								<div
									style={{
										width: `${percent}%`,
										height: '100%',
										background: color,
										borderRadius: 999,
									}}
								/>
							</div>
						</div>
					);
				})
			)}
		</div>
	);
};

export default SimpleBarChart;
