import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';

const items = [
  { key: '/', label: <Link to="/">总览</Link> },
  { key: '/reservations', label: <Link to="/reservations">预约</Link> },
  { key: '/rooms', label: <Link to="/rooms">琴房</Link> },
  { key: '/students', label: <Link to="/students">学员</Link> },
  { key: '/lessons', label: <Link to="/lessons">课程</Link> },
  { key: '/payments', label: <Link to="/payments">收款</Link> },
  { key: '/reports', label: <Link to="/reports">报表</Link> },
  { key: '/settings', label: <Link to="/settings">设置</Link> }
];

const NavSide = () => {
  const { pathname } = useLocation();
  return (
    <Layout.Sider width={200} theme="light">
      <Menu mode="inline" selectedKeys={[pathname]} items={items} />
    </Layout.Sider>
  );
};

export default NavSide;

