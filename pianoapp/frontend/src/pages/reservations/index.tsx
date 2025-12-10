import { useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid/index.js';
import timeGridPlugin from '@fullcalendar/timegrid/index.js';
import interactionPlugin from '@fullcalendar/interaction/index.js';
import { Alert, Card, Button, Modal, Form, Input, DatePicker, message } from 'antd';
import { useReservations, useCreateReservation } from '../../api/reservations';
import dayjs, { Dayjs } from 'dayjs';

const fallbackEvents = [
  {
    id: 'demo-1',
    title: '示例预约 - 琴房1',
    start: new Date().toISOString(),
    end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    studentId: 'student-demo'
  }
];

const Reservations = () => {
  const [range, setRange] = useState<{ start: string; end: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<{
    title: string;
    studentId: string;
    roomId: string;
    time: [Dayjs, Dayjs];
  }>();
  const { data, isLoading, error } = useReservations(
    range ?? { start: '', end: '' }
  );
  const createReservation = useCreateReservation();

  const events = useMemo(() => data ?? fallbackEvents, [data]);

  const openCreate = () => {
    const start = dayjs().minute(0).second(0);
    const end = start.add(1, 'hour');
    form.setFieldsValue({ time: [start, end] } as any);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const [start, end] = values.time;
      await createReservation.mutateAsync({
        title: values.title,
        studentId: values.studentId,
        roomId: values.roomId,
        start: start.toISOString(),
        end: end.toISOString()
      });
      message.success('创建成功');
      setModalOpen(false);
      form.resetFields();
    } catch (e: any) {
      if (e?.message) message.error(e.message);
    }
  };

  return (
    <Card
      title="预约日历"
      extra={
        <Button type="primary" onClick={openCreate}>
          新建预约
        </Button>
      }
    >
      {error ? (
        <Alert
          type="warning"
          message="加载预约数据失败，显示示例数据"
          style={{ marginBottom: 12 }}
        />
      ) : null}
      <FullCalendar
        height="80vh"
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        weekends
        selectable
        selectMirror
        events={events}
        eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        datesSet={(arg) => setRange({ start: arg.startStr, end: arg.endStr })}
        select={(info) => {
          // TODO: 打开创建预约弹窗并调用 useCreateReservation
          console.log('selected slot', info.startStr, info.endStr);
        }}
        loading={(isNowLoading) => {
          if (isNowLoading) {
            // FullCalendar has its own spinner; rely on Card layout
          }
        }}
        lazyFetching={!isLoading}
        nowIndicator
        slotDuration="00:30:00"
        slotMinTime="08:00:00"
        slotMaxTime="22:00:00"
      />
      <Modal
        title="新建预约"
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={createReservation.isPending}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="示例：学生A 练琴" />
          </Form.Item>
          <Form.Item
            name="studentId"
            label="学员ID"
            rules={[{ required: true, message: '请输入学员ID' }]}
          >
            <Input placeholder="student-1" />
          </Form.Item>
          <Form.Item
            name="roomId"
            label="琴房ID"
            rules={[{ required: true, message: '请输入琴房ID' }]}
          >
            <Input placeholder="room-1" />
          </Form.Item>
          <Form.Item
            name="time"
            label="时间段"
            rules={[{ required: true, message: '请选择时间段' }]}
          >
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

export default Reservations;

