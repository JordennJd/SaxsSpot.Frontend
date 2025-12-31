import { type ReactNode } from 'react';
import { Header } from './Header';
import { ErrorNotification, useErrorNotification } from '../ui/common/ErrorNotification';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { error, clearError } = useErrorNotification();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 md:py-6">
        {children}
      </main>
      <ErrorNotification 
        error={error ?? undefined} 
        onClose={clearError}
      />
    </div>
  );
}; 