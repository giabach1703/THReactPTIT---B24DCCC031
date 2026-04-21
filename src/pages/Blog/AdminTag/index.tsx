import React, { useEffect, useState } from 'react';
import { Button, message, Popconfirm, Space, Table, Tag } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { createTag, deleteTag, getTags, updateTag } from '@/services/Blog/tag';
import { getPosts } from '@/services/Blog/post';
import { countPostsByTag } from '@/utils/blog';
import TagForm from './components/TagForm';
import type { BlogPost, BlogTag } from '@/services/Blog/typing';

const AdminTagPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [visible, setVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BlogTag | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tagRes, postRes] = await Promise.all([getTags(), getPosts()]);
      setTags(tagRes?.data || []);
      setPosts(postRes?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (values: Pick<BlogTag, 'name' | 'color'>) => {
    await createTag(values);
    message.success('Thêm thẻ thành công');
    setVisible(false);
    setEditingRecord(null);
    fetchData();
  };

  const handleUpdate = async (values: Pick<BlogTag, 'name' | 'color'>) => {
    if (!editingRecord) return;
    await updateTag(editingRecord.id, values);
    message.success('Cập nhật thẻ thành công');
    setVisible(false);
    setEditingRecord(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await deleteTag(id);
    message.success('Xóa thẻ thành công');
    fetchData();
  };

  return (
    <PageContainer title="Quản lý thẻ">
      <div
        style={{
          background: '#fff',
          padding: 16,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Button
          type="primary"
          onClick={() => {
            setEditingRecord(null);
            setVisible(true);
          }}
        >
          Thêm thẻ
        </Button>
      </div>

      <Table<BlogTag>
        rowKey="id"
        loading={loading}
        dataSource={tags}
        pagination={{ pageSize: 8 }}
        columns={[
          {
            title: 'Tên thẻ',
            dataIndex: 'name',
            key: 'name',
            render: (value: string, record: BlogTag) => (
              <Tag color={record.color || 'blue'}>{value}</Tag>
            ),
          },
          {
            title: 'Số bài viết đang sử dụng',
            key: 'count',
            render: (_, record: BlogTag) => countPostsByTag(posts, record.name),
          },
          {
            title: 'Thao tác',
            key: 'action',
            width: 180,
            render: (_, record: BlogTag) => (
              <Space>
                <Button
                  type="link"
                  onClick={() => {
                    setEditingRecord(record);
                    setVisible(true);
                  }}
                >
                  Sửa
                </Button>

                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa thẻ này?"
                  onConfirm={() => handleDelete(record.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button type="link" danger>
                    Xóa
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <TagForm
        visible={visible}
        initialValues={editingRecord}
        onCancel={() => {
          setVisible(false);
          setEditingRecord(null);
        }}
        onSubmit={editingRecord ? handleUpdate : handleCreate}
      />
    </PageContainer>
  );
};

export default AdminTagPage;