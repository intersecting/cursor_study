import React from 'react';
import { Result, Button } from 'antd';

type ErrorBoundaryState = { hasError: boolean };

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Unhandled error', error);
  }

  handleReload = () => window.location.reload();

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="页面出错"
          subTitle="请刷新或稍后重试"
          extra={
            <Button type="primary" onClick={this.handleReload}>
              刷新
            </Button>
          }
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

