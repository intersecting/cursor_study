import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './layouts/app-layout';
import AuthLayout from './layouts/auth-layout';
import AuthGuard from './auth/auth-guard';
import Dashboard from './pages/dashboard';
import Reservations from './pages/reservations';
import Rooms from './pages/rooms';
import Students from './pages/students';
import Lessons from './pages/lessons';
import Payments from './pages/payments';
import Reports from './pages/reports';
import Settings from './pages/settings';
import Login from './pages/auth/login';

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: '/login', element: <Login /> }]
  },
  {
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/reservations', element: <Reservations /> },
      { path: '/rooms', element: <Rooms /> },
      { path: '/students', element: <Students /> },
      { path: '/lessons', element: <Lessons /> },
      { path: '/payments', element: <Payments /> },
      { path: '/reports', element: <Reports /> },
      { path: '/settings', element: <Settings /> }
    ]
  }
]);

export default router;

