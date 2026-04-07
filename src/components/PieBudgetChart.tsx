import React from 'react';

export type PieBudgetItem = {
	label: string;
	value: number;
	color: string;
};

type Props = {
	data: PieBudgetItem[];
	size?: number;
};

function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
	const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
	return {
		x: cx + r * Math.cos(angleInRadians),
		y: cy + r * Math.sin(angleInRadians),
	};
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
	const start = polarToCartesian(cx, cy, r, endAngle);
	const end = polarToCartesian(cx, cy, r, startAngle);
	const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

	return ['M', cx, cy, 'L', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y, 'Z'].join(' ');
}

const PieBudgetChart = ({ data, size = 220 }: Props) => {
	const total = data.reduce((sum, item) => sum + item.value, 0);

	if (!total) {
		return (
			<div
				style={{
					height: size,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					border: '1px dashed #d9d9d9',
					borderRadius: 12,
				}}
			>
				Chưa có dữ liệu để hiển thị biểu đồ
			</div>
		);
	}

	let currentAngle = 0;
	const radius = size / 2 - 10;
	const center = size / 2;

	return (
		<div
			style={{
				display: 'flex',
				flexWrap: 'wrap',
				gap: 24,
				alignItems: 'center',
			}}
		>
			<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
				{data.map((item) => {
					const angle = (item.value / total) * 360;
					const path = describeArc(center, center, radius, currentAngle, currentAngle + angle);
					currentAngle += angle;

					return <path key={item.label} d={path} fill={item.color} stroke='#fff' strokeWidth={2} />;
				})}

				<circle cx={center} cy={center} r={size / 4.2} fill='#fff' />
				<text x='50%' y='48%' textAnchor='middle' fontSize='18' fontWeight='bold'>
					{total.toLocaleString('vi-VN')}
				</text>
				<text x='50%' y='58%' textAnchor='middle' fontSize='12' fill='#666'>
					Tổng chi phí
				</text>
			</svg>

			<div style={{ minWidth: 220 }}>
				{data.map((item) => {
					const percent = Math.round((item.value / total) * 100);

					return (
						<div
							key={item.label}
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								gap: 12,
								marginBottom: 12,
							}}
						>
							<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
								<span
									style={{
										width: 12,
										height: 12,
										borderRadius: '50%',
										background: item.color,
										display: 'inline-block',
									}}
								/>
								<span>{item.label}</span>
							</div>

							<div style={{ textAlign: 'right' }}>
								<div>{item.value.toLocaleString('vi-VN')} đ</div>
								<div style={{ fontSize: 12, color: '#888' }}>{percent}%</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default PieBudgetChart;
