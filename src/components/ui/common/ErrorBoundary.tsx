import { Component, type ErrorInfo, type ReactNode } from 'react';
import { type ComponentProps } from '@/types/global';
import { handleError } from '../../../lib/errorHandler';

interface ErrorStateProps extends ComponentProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  fullScreen?: boolean;
}

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  retryText = 'Try Again',
  fullScreen = false,
  className = '',
}: ErrorStateProps) => {
  const content = (
    <div className={`text-center p-6 ${className}`}>
      <div className="flex justify-center mb-4">
        <svg 
          className="h-12 w-12 text-red-500"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
          />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
        {message}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          {retryText}
        </button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
      {content}
    </div>
  );
};

// Error Boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Handle error with our error handler
    handleError(error);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default error UI
      return (
        <ErrorState
          title="Application Error"
          message="Something went wrong in the application. Please refresh the page or try again."
          onRetry={this.resetError}
          retryText="Reset Error"
          fullScreen
        />
      );
    }

    return this.props.children;
  }
} 