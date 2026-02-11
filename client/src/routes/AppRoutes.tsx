import type { RouteObject } from 'react-router';
import { AppNavigation } from '../constants/navigation.constants';
import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home/Home';
import Work from '@/pages/Work/Work';
import About from '@/pages/About/About';

const AppRoutes: RouteObject[] = [
  {
    path: AppNavigation.HOME,
    Component: AppLayout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: AppNavigation.WORK,
        Component: Work,
      },
      {
        path: AppNavigation.ABOUT,
        Component: About,
      },
    ],
  },
];

export default AppRoutes;
