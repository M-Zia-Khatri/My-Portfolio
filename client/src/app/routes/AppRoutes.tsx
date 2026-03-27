import Auth from '@/features/auth/Auth';
import Dashboard from '@/features/dashboard/Dashboard';
import DashboardLayout from '@/features/dashboard/layout/DashboardLayout';
import Contact from '@/features/dashboard/pages/contact/Contact';
import Portfolio from '@/features/dashboard/pages/portfolio/Portfolio';
import Skills from '@/features/dashboard/pages/skills/Skills';
import Home from '@/features/home/Home';
import AppLayout from '@/shared/components/layout/AppLayout';
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
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: AppNavigation.A_SKILLS,
        Component: Skills,
      },
      {
        path: AppNavigation.A_PORTFOLIO,
        Component: Portfolio,
      },
      {
        path: AppNavigation.A_CONTACT,
        Component: Contact,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" />,
  },
];

export default AppRoutes;
