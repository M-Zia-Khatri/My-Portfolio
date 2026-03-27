import Auth from '@/features/auth/Auth';
import Dashboard from '@/features/dashboard/Dashboard';
import Home from '@/features/home/Home';
import AppLayout from '@/shared/components/layout/AppLayout';
import ProtectedRoute from '@/shared/components/ProtectedRoute';
import { AppNavigation } from '@/shared/constants/navigation.constants';
import { Navigate, type RouteObject } from 'react-router';

const AppRoutes: RouteObject[] = [
  {
    path: '/',
    Component: AppLayout,
    children: [
      {
        index: true,
        Component: Home,
      },
    ],
  },
  {
    path: AppNavigation.AUTH,
    Component: Auth,
  },
  { path: '/login', element: <Navigate to={AppNavigation.AUTH} /> },
  {
    path: '/admin',
    element: <Navigate to={AppNavigation.DASHBOARD} />,
  },
  {
    path: AppNavigation.DASHBOARD,
    element: (
      <ProtectedRoute
        allowedRoles={['admin']}
        redirectTo={AppNavigation.AUTH}
        unauthorizedRedirectTo="/"
      >
        {/* Add the children here */}
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" />,
  },
];

export default AppRoutes;
