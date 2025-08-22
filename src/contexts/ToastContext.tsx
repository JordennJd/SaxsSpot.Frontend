import { createContext, useContext, type ReactNode } from 'react';
import { useToast, type UseToastReturn } from '../hooks/useToast';
import { ToastContainer } from '../components/ui/common/ToastContainer';

// Create context
const ToastContext = createContext<UseToastReturn | null>(null);

// Provider component
interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const toastMethods = useToast();

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      <ToastContainer
        toasts={toastMethods.toasts}
        onRemove={toastMethods.removeToast}
      />
    </ToastContext.Provider>
  );
};

// Hook to use toast context
export const useToastContext = (): UseToastReturn => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  
  return context;
}; 