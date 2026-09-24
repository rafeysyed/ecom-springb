import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ToastProvider } from '@/components/ui/Toast';
import { SearchProvider } from '@/context/SearchContext';
import { AppRouter } from '@/routes/AppRouter';


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