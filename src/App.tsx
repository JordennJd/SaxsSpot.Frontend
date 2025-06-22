// src/App.tsx
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NanosystemsTable } from "./features/nanosystems/components/NanosystemsTable";

// Создаём клиент React Query
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">SAXS Data Explorer</h1>
        <NanosystemsTable />
      </div>
    </QueryClientProvider>
  );
}

export default App;