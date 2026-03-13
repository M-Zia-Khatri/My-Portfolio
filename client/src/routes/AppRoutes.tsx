import type { RouteObject } from 'react-router';
// import { AppNavigation } from '../constants/navigation.constants';
import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home/Home';

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
];

export default AppRoutes;
