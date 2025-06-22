// src/App.tsx
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NanosystemSeriesListPage } from "./pages/NanosystemSeriesListPage";
import { NanosystemSeriesAddPage } from "./pages/NanosystemSeriesAddPage";
import { SeriesDetailPage } from "./pages/SerialDetailPage";

// Создаём клиент React Query
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6">SaxsSpot</h1>
          <Routes>
            <Route path="/" element={<NanosystemSeriesListPage />} />
            <Route path="/new" element={<NanosystemSeriesAddPage />} />
            <Route path="/series/:guid" element={<SeriesDetailPage />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;