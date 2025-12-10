import { useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid/index.js';
import timeGridPlugin from '@fullcalendar/timegrid/index.js';
import interactionPlugin from '@fullcalendar/interaction/index.js';
import { Alert, Card, Button, Modal, Form, Input, DatePicker, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useLessons, useCreateLesson } from '../../api/lessons';

const Lessons = () => {
  const [range, setRange] = useState<{ start: string; end: string } | null>(null);
  const { data, error } = useLessons(range ?? { start: '', end: '' });
  const createLesson = useCreateLesson();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<{
    title: string;
    teacherId: string;
    studentId: string;
    roomId?: string;
    time: [Dayjs, Dayjs];
  }>();

  const events = useMemo(
    () =>
      (data ?? []).map((l) => ({
        id: l.id,
        title: `${l.title}（师:${l.teacherId} 生:${l.studentId})`,
        start: l.start,
        end: l.end
      })),
    [data]
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const [start, end] = values.time;
      await createLesson.mutateAsync({
        title: values.title,
        teacherId: values.teacherId,
        studentId: values.studentId,
        roomId: values.roomId,
        start: start.toISOString(),
        end: end.toISOString()
      });
      message.success('排课成功');
      setOpen(false);
      form.resetFields();
    } catch (e: any) {
      if (e?.message) message.error(e.message);
    }
  };

  return (
    <Card
      title="课程排课"
      extra={
        <Button type="primary" onClick={() => setOpen(true)}>
          新建课程
        </Button>
      }
    >
      {error ? <Alert type="warning" message="加载课程数据失败" style={{ marginBottom: 12 }} /> : null}
      <FullCalendar
        height="80vh"
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
        events={events}
        datesSet={(arg) => setRange({ start: arg.startStr, end: arg.endStr })}
        nowIndicator
        slotDuration="00:30:00"
      />

      <Modal
        title="新建课程"
        open={open}
        onOk={handleSubmit}
        confirmLoading={createLesson.isPending}
        onCancel={() => setOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="示例：钢琴一对一" />
          </Form.Item>
          <Form.Item name="teacherId" label="老师ID" rules={[{ required: true, message: '请输入老师ID' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="studentId" label="学员ID" rules={[{ required: true, message: '请输入学员ID' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="roomId" label="琴房ID">
            <Input />
          </Form.Item>
          <Form.Item name="time" label="时间段" rules={[{ required: true, message: '请选择时间段' }]}>
            <DatePicker.RangePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Lessons;

