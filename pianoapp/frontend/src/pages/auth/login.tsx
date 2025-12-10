import { Button, Card, Form, Input } from 'antd';
import { useAuthContext } from '../../auth/auth-context';
import { useLocation, useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';

  const onFinish = (values: { phone: string; password: string }) => {
    // TODO: replace with real API call to fetch token and user info
    login('dummy-token', { id: '1', name: values.phone, role: 'admin' });
    navigate(from, { replace: true });
  };

  return (
    <Card title="琴行管理登录" style={{ width: 360 }}>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="phone" label="手机号" rules={[{ required: true, message: '请输入手机号' }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="密码"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>
          登录
        </Button>
      </Form>
    </Card>
  );
};

export default Login;

