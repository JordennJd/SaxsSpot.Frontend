// src/App.tsx
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { NanosystemSeriesListPage } from "./pages/NanosystemSeriesListPage";
import { NanosystemSeriesAddPage } from "./pages/NanosystemSeriesAddPage";
import { SeriesDetailPage } from "./pages/SerialDetailPage";
import { CogIcon } from "@heroicons/react/24/solid";

// Создаём клиент React Query
const queryClient = new QueryClient();
const Header = () => {
  const navigate = useNavigate();

  return (
    <header 
      className="bg-gradient-to-r from-blue-900 to-indigo-900 shadow-lg sticky top-0 z-10"
    >
      <div className="container mx-auto px-4 py-3 flex items-center cursor-pointer">
        <div className="flex items-center space-x-3">
          
          <h1 className="text-2xl md:text-3xl font-bold text-white"
          >
            <span className="text-cyan-30">Saxs</span>
            <span className="text-yellow-300">Spot</span>
          </h1>
        </div>
        
        <nav className="ml-auto hidden md:block">
          <ul className="flex space-x-6 font-mono">
            <li onClick={() => navigate('/')} className="text-gray-300 hover:text-yellow-300 transition-colors flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Experiments
            </li>
            <li className="text-gray-300 hover:text-yellow-300 transition-colors flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              Analysis
            </li>
            <li className="text-gray-300 hover:text-yellow-300 transition-colors flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Publications
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Научный статус бар */}
      <div className="bg-white bg-opacity-30 text-xs text-blue py-1 px-4 flex justify-between font-mono">
        <span>System status: <span className="text-green-400">Online</span></span>
        <span>Last experiment: {new Date().toLocaleDateString()}</span>
        <span>SAXS version: beta</span>
      </div>
    </header>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="container mx-auto p-4">
        <Header />
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