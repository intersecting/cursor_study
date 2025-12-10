import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';

const AuthLayout = () => (
  <Layout style={{ minHeight: '100vh' }}>
    <Layout.Content
      style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Outlet />
    </Layout.Content>
  </Layout>
);

export default AuthLayout;

