import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import NavSide from '../components/nav-side';
import NavTop from '../components/nav-top';

const AppLayout = () => (
  <Layout style={{ minHeight: '100vh' }}>
    <NavSide />
    <Layout>
      <NavTop />
      <Layout.Content style={{ padding: 24 }}>
        <Outlet />
      </Layout.Content>
    </Layout>
  </Layout>
);

export default AppLayout;

