import { Spin } from 'antd';

const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
    <Spin />
  </div>
);

export default Loading;

