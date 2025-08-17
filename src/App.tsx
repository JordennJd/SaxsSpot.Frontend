import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { NanosystemSeriesListPage } from "./pages/NanosystemSeriesListPage";
import { NanosystemSeriesAddPage } from "./pages/NanosystemSeriesAddPage";
import { SeriesDetailPage } from "./pages/SerialDetailPage";
import JobManagementDashboard from "./pages/JobManagementDashboard";
import { CalculationChartPage } from "./pages/CalculationChartPage";

// React Query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;