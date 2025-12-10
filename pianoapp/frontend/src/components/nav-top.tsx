import { Layout, Space, Button } from 'antd';
import { useAuthContext } from '../auth/auth-context';

const NavTop = () => {
  const { user, logout } = useAuthContext();
  return (
    <Layout.Header
      style={{
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingInline: 24
      }}
    >
      <Space>
        <span>{user?.name}</span>
        <Button size="small" onClick={logout}>
          退出
        </Button>
      </Space>
    </Layout.Header>
  );
};

export default NavTop;

