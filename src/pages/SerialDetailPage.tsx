// src/pages/SeriesDetailPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';

export const SeriesDetailPage = () => {
  // Получаем GUID из URL параметров
  const { guid } = useParams<{ guid: string }>();

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Nanosystem Series Details</h1>
        
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-semibold">GUID:</span> {guid}
          </p>
          
          <div className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              This is a placeholder page for series with GUID: {guid}
            </p>
            <p className="text-sm mt-2">
              Future implementation will show detailed information about this nanosystem series.
            </p>
          </div>
          
          <div className="mt-6">
            {/* <Button 
              onClick={() => window.history.back()} 
              variant="secondary"
            >
              Back to List
            </Button> */}
          </div>
        </div>
      </div>
    </div>
  );
};