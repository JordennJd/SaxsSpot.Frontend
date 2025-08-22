import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { NanosystemSeriesListPage } from './pages/NanosystemSeriesListPage';
import { NanosystemSeriesAddPage } from './pages/NanosystemSeriesAddPage';
import { SeriesDetailPage } from './pages/SerialDetailPage';
import JobManagementDashboard from './pages/JobManagementDashboard';
import { CalculationChartPage } from './pages/CalculationChartPage';
import { ErrorBoundary } from './components/ui/common/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';
import { config } from './lib/config';
import { handleError, isRetryableError, getRetryDelay } from './lib/errorHandler';

// React Query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const appError = handleError(error as Error);
        
        // Don't retry certain error types
        if (!isRetryableError(appError)) {
          return false;
        }
        
        // Limit retry attempts
        return failureCount < 3;
      },
      retryDelay: (attemptIndex, error) => {
        const appError = handleError(error as Error);
        return getRetryDelay(appError, attemptIndex);
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      // Enable background refetch for better UX
      refetchOnMount: true,
    },
    mutations: {
      retry: (failureCount, error) => {
        const appError = handleError(error as Error);
        
        // Only retry network errors for mutations
        return isRetryableError(appError) && failureCount < 2;
      },
      retryDelay: (attemptIndex, error) => {
        const appError = handleError(error as Error);
        return getRetryDelay(appError, attemptIndex);
      },
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<NanosystemSeriesListPage />} />
                <Route path="/new" element={<NanosystemSeriesAddPage />} />
                <Route path="/series/:guid" element={<SeriesDetailPage />} />
                <Route path="/jobs" element={<JobManagementDashboard />} />
                <Route path="/calculations/:guid/chart" element={<CalculationChartPage />} />
              </Routes>
            </Layout>
          </Router>
          {/* React Query Devtools - only in development */}
          {config.app.isDevelopment && (
            <div>
              {/* Devtools would go here if installed */}
              {/* <ReactQueryDevtools initialIsOpen={false} /> */}
            </div>
          )}
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;