/**
 * App.tsx — wire AuthProvider around the router
 *
 * File placement: src/app/App.tsx
 */

import { RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Theme } from '@radix-ui/themes';
import { AppRouter } from './routes/router';
import { AuthProvider } from '@/features/auth/context/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      retry: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Theme
        appearance="dark"
        accentColor="blue"
        grayColor="gray"
        radius="small"
        scaling="100%"
        className="bg-(--color-background) overflow-hidden"
      >
        <AuthProvider>
          <RouterProvider router={AppRouter} />
        </AuthProvider>
      </Theme>
    </QueryClientProvider>
  );
}
