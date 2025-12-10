import { Button, Card, Form, Input, Modal, Table, message } from 'antd';
import { useState } from 'react';
import { useCreateStudent, useStudents } from '../../api/students';

const Students = () => {
  const { data, isLoading } = useStudents();
  const createStudent = useCreateStudent();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<{ name: string; phone?: string; guardianName?: string }>();

  const columns = [
    { title: '姓名', dataIndex: 'name' },
    { title: '手机号', dataIndex: 'phone' },
    { title: '监护人', dataIndex: 'guardianName' },
    { title: 'ID', dataIndex: 'id' }
  ];

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await createStudent.mutateAsync(values);
      message.success('创建成功');
      setOpen(false);
      form.resetFields();
    } catch (e: any) {
      if (e?.message) message.error(e.message);
    }
  };

  return (
    <Card
      title="学员档案"
      extra={
        <Button type="primary" onClick={() => setOpen(true)}>
          新建学员
        </Button>
      }
    >
      <Table
        loading={isLoading}
        dataSource={data ?? []}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title="新建学员"
        open={open}
        onOk={handleOk}
        confirmLoading={createStudent.isPending}
        onCancel={() => setOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input />
          </Form.Item>
          <Form.Item name="guardianName" label="监护人">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Students;

