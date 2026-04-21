import React from 'react';
import { Avatar, Card, Col, Row, Tag, Typography, Space } from 'antd';
import { FacebookFilled, GithubFilled, LinkedinFilled, MailOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';

const { Paragraph, Title } = Typography;

const BlogAboutPage: React.FC = () => {
	return (
		<PageContainer title='Giới thiệu tác giả'>
			<Card>
				<Row gutter={[24, 24]} align='middle'>
					<Col xs={24} md={8} style={{ textAlign: 'center' }}>
						<Avatar size={180} src='https://i.pravatar.cc/300?img=12' />
					</Col>

					<Col xs={24} md={16}>
						<Title level={2}>Đỗ Đăng Khoa</Title>

						<Paragraph>
							Tôi là người yêu thích công nghệ, lập trình web và chia sẻ kiến thức. Blog này được tạo ra để ghi lại kinh
							nghiệm học tập, thực hành code và những điều hữu ích trong quá trình phát triển bản thân.
						</Paragraph>

						<Paragraph>
							Mục tiêu của tôi là viết các bài dễ hiểu, thực tế, có thể áp dụng ngay cho sinh viên hoặc người mới học
							lập trình.
						</Paragraph>

						<div style={{ marginBottom: 16 }}>
							<strong>Kỹ năng:</strong>
							<div style={{ marginTop: 8 }}>
								<Tag color='blue'>ReactJS</Tag>
								<Tag color='cyan'>UmiJS</Tag>
								<Tag color='geekblue'>Ant Design</Tag>
								<Tag color='gold'>JavaScript</Tag>
								<Tag color='volcano'>TypeScript</Tag>
								<Tag color='green'>Frontend</Tag>
							</div>
						</div>

						<div>
							<strong>Liên kết mạng xã hội:</strong>
							<div style={{ marginTop: 12 }}>
								<Space size='large'>
									<a href='https://facebook.com' target='_blank' rel='noreferrer'>
										<FacebookFilled style={{ fontSize: 24 }} />
									</a>
									<a href='https://github.com' target='_blank' rel='noreferrer'>
										<GithubFilled style={{ fontSize: 24 }} />
									</a>
									<a href='https://linkedin.com' target='_blank' rel='noreferrer'>
										<LinkedinFilled style={{ fontSize: 24 }} />
									</a>
									<a href='mailto:example@gmail.com'>
										<MailOutlined style={{ fontSize: 24 }} />
									</a>
								</Space>
							</div>
						</div>
					</Col>
				</Row>
			</Card>
		</PageContainer>
	);
};

export default BlogAboutPage;
