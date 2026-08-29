import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/Toast';
import { SearchProvider } from '@/context/SearchContext';
import { AppRouter } from '@/routes/AppRouter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SearchProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </SearchProvider>
    </QueryClientProvider>
  );
}