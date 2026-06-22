import { type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from './Header';
import { ErrorNotification, useErrorNotification } from '../ui/common/ErrorNotification';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { error, clearError } = useErrorNotification();
  const [searchParams] = useSearchParams();
  const standalone = searchParams.get('standalone') === '1';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {!standalone && <Header />}
      <main className={`mx-auto px-2 sm:px-4 ${standalone ? 'py-2 max-w-none' : 'container py-3 sm:py-4 md:py-6'}`}>
        {children}
      </main>
      <ErrorNotification 
        error={error ?? undefined} 
        onClose={clearError}
      />
    </div>
  );
}; 