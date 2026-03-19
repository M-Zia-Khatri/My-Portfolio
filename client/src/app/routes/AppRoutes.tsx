import type { RouteObject } from 'react-router';
// import { AppNavigation } from '../constants/navigation.constants';
import AppLayout from '@/shared/components/layout/AppLayout';
import Home from '@/features/home/Home';

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
