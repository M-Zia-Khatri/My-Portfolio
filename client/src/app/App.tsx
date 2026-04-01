import { AuthProvider } from '@/features/auth/context/AuthContext';
import { Theme } from '@radix-ui/themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { AppRouter } from './routes/router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1_000 * 60 * 7.5,
      gcTime: 1_000 * 60 * 15,
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
        className="bg-(--color-background)"
      >
        <AuthProvider>
          <RouterProvider router={AppRouter} />
        </AuthProvider>
      </Theme>
    </QueryClientProvider>
  );
}
