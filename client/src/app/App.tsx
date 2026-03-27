/**
 * App.tsx — wire AuthProvider around the router
 *
 * File placement: src/app/App.tsx
 */

import { AuthProvider } from '@/features/auth/context/AuthContext';
import { LenisProvider } from '@/shared/providers/LenisProvider';
import { Theme } from '@radix-ui/themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { AppRouter } from './routes/router';

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
        className="overflow-hidden bg-(--color-background)"
      >
        <LenisProvider>
          <AuthProvider>
            <RouterProvider router={AppRouter} />
          </AuthProvider>
        </LenisProvider>
      </Theme>
    </QueryClientProvider>
  );
}
