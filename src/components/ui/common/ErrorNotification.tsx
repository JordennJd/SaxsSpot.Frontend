import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { errorHandler, type AppError, ErrorType, ErrorSeverity } from '../../../lib/errorHandler';

interface ErrorNotificationProps {
  error?: AppError;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export const ErrorNotification = ({ 
  error, 
  onClose, 
  autoClose = true, 
  autoCloseDelay = 5000, 
}: ErrorNotificationProps) => {
  const [isVisible, setIsVisible] = useState(!!error);

  useEffect(() => {
    if (error && autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [error, autoClose, autoCloseDelay, onClose]);

  useEffect(() => {
    setIsVisible(!!error);
  }, [error]);

  if (!error || !isVisible) return null;

  const severity = errorHandler.getErrorSeverity(error);
  
  const getNotificationStyles = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'bg-red-50 border-red-200 text-red-800';
      case ErrorSeverity.HIGH:
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case ErrorSeverity.MEDIUM:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case ErrorSeverity.LOW:
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIconColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'text-red-400';
      case ErrorSeverity.HIGH:
        return 'text-orange-400';
      case ErrorSeverity.MEDIUM:
        return 'text-yellow-400';
      case ErrorSeverity.LOW:
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getErrorIcon = (type: ErrorType) => {
    switch (type) {
      case ErrorType.NETWORK:
        return '🌐';
      case ErrorType.AUTHENTICATION:
        return '🔒';
      case ErrorType.AUTHORIZATION:
        return '🚫';
      case ErrorType.VALIDATION:
        return '⚠️';
      case ErrorType.NOT_FOUND:
        return '🔍';
      case ErrorType.SERVER:
        return '🔧';
      default:
        return '❌';
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-md w-full
      border rounded-lg shadow-lg p-4
      transition-all duration-300 ease-in-out
      ${getNotificationStyles(severity)}
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-lg" role="img" aria-label="Error icon">
            {getErrorIcon(error.type)}
          </span>
        </div>
        <div className="ml-3 w-0 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              {error.type.replace('_', ' ')} Error
            </h3>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className={`inline-flex ${getIconColor(severity)} hover:opacity-75 transition-opacity`}
                onClick={handleClose}
                aria-label="Close notification"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="mt-2 text-sm">
            <p>{error.message}</p>
            {error.code && (
              <p className="mt-1 text-xs opacity-75">
                Code: {error.code}
              </p>
            )}
          </div>
          {errorHandler.shouldRetry(error) && (
            <div className="mt-3">
              <button
                className={`text-xs underline hover:no-underline ${getIconColor(severity)}`}
                onClick={() => {
                  // Emit retry event or call retry callback
                  window.dispatchEvent(new CustomEvent('error-retry', { detail: error }));
                }}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Global error notification hook
export const useErrorNotification = () => {
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    const handleError = (error: AppError) => {
      setError(error);
    };

    errorHandler.addErrorListener(handleError);

    return () => {
      errorHandler.removeErrorListener(handleError);
    };
  }, []);

  const clearError = () => {
    setError(null);
  };

  return {
    error,
    clearError,
    showError: setError,
  };
}; 