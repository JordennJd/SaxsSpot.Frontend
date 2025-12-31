import { ApiError } from './axios';
import { config } from './config';

// Error types
export const ErrorType = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  code?: string;
  timestamp: Date;
}

// Error severity levels
export const ErrorSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export type ErrorSeverity = typeof ErrorSeverity[keyof typeof ErrorSeverity];

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorListeners: Array<(error: AppError) => void> = [];

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Add error listener
  public addErrorListener(listener: (error: AppError) => void): void {
    this.errorListeners.push(listener);
  }

  // Remove error listener
  public removeErrorListener(listener: (error: AppError) => void): void {
    this.errorListeners = this.errorListeners.filter(l => l !== listener);
  }

  // Handle API errors
  public handleApiError(error: ApiError | Error): AppError {
    const appError = this.transformError(error);
    this.logError(appError);
    this.notifyListeners(appError);
    return appError;
  }

  // Transform errors to AppError
  private transformError(error: ApiError | Error): AppError {
    if (error instanceof ApiError) {
      const responseData = error.response?.data;
      return {
        type: this.getErrorType(error.status, error.code),
        message: this.getErrorMessage(error.status, error.message, responseData),
        details: error.response,
        code: error.code,
        timestamp: new Date(),
      };
    }

    return {
      type: ErrorType.UNKNOWN,
      message: error.message || 'Unknown error occurred',
      timestamp: new Date(),
    };
  }

  // Get error type based on status code
  private getErrorType(status?: number, code?: string): ErrorType {
    if (code === 'NETWORK_ERROR' || code === 'ECONNABORTED') {
      return ErrorType.NETWORK;
    }

    switch (status) {
      case 400:
        return ErrorType.VALIDATION;
      case 401:
        return ErrorType.AUTHENTICATION;
      case 403:
        return ErrorType.AUTHORIZATION;
      case 404:
        return ErrorType.NOT_FOUND;
      case 500:
      case 502:
      case 503:
      case 504:
        return ErrorType.SERVER;
      default:
        return ErrorType.UNKNOWN;
    }
  }

  // Get user-friendly error messages
  private getErrorMessage(status?: number, originalMessage?: string, responseData?: any): string {
    // For 400 errors, try to extract specific error messages from ResultDto
    if (status === 400 && responseData) {
      // Check if it's a ResultDto with errors array
      if (responseData.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
        // Return the first error message or join all errors
        return responseData.errors.join('. ') || responseData.errors[0];
      }
      // Check if it's a ResultDto with errorMessage
      if (responseData.errorMessage) {
        return responseData.errorMessage;
      }
      // Check if it's a ProblemDetails with detail
      if (responseData.detail) {
        return responseData.detail;
      }
      // Check if it's a ProblemDetails with errors
      if (responseData.errors && typeof responseData.errors === 'object') {
        const errorMessages: string[] = [];
        for (const key in responseData.errors) {
          const value = responseData.errors[key];
          if (Array.isArray(value)) {
            errorMessages.push(...value);
          } else if (typeof value === 'string') {
            errorMessages.push(value);
          }
        }
        if (errorMessages.length > 0) {
          return errorMessages.join('. ');
        }
      }
    }

    switch (status) {
      case 400:
        return originalMessage || 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 502:
        return 'Service temporarily unavailable. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      case 504:
        return 'Request timeout. Please try again.';
      default:
        return originalMessage || 'An unexpected error occurred.';
    }
  }

  // Get error severity
  public getErrorSeverity(error: AppError): ErrorSeverity {
    switch (error.type) {
      case ErrorType.NETWORK:
      case ErrorType.SERVER:
        return ErrorSeverity.HIGH;
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return ErrorSeverity.MEDIUM;
      case ErrorType.VALIDATION:
      case ErrorType.NOT_FOUND:
        return ErrorSeverity.LOW;
      default:
        return ErrorSeverity.MEDIUM;
    }
  }

  // Log errors
  private logError(error: AppError): void {
    const severity = this.getErrorSeverity(error);
    // const logData = {
    //   type: error.type,
    //   message: error.message,
    //   code: error.code,
    //   details: error.details,
    //   timestamp: error.timestamp,
    //   severity,
    // };

    if (config.app.isDevelopment) {
      console.group(`🔴 Error [${severity}]`);
      console.error('Message:', error.message);
      console.error('Type:', error.type);
      console.error('Code:', error.code);
      console.error('Details:', error.details);
      console.error('Timestamp:', error.timestamp);
      console.groupEnd();
    }

    // In production, you might want to send errors to a logging service
    if (config.app.isProduction && severity === ErrorSeverity.CRITICAL) {
      // Send to error tracking service (e.g., Sentry, LogRocket)
      // this.sendToErrorTracking(logData);
    }
  }

  // Notify error listeners
  private notifyListeners(error: AppError): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError);
      }
    });
  }

  // Utility method to check if error should be retried
  public shouldRetry(error: AppError): boolean {
    return error.type === ErrorType.NETWORK || 
           (error.type === ErrorType.SERVER && error.code !== '500');
  }

  // Get retry delay based on error type
  public getRetryDelay(error: AppError, attempt: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds

    if (error.type === ErrorType.NETWORK) {
      // Exponential backoff for network errors
      return Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    }

    if (error.type === ErrorType.SERVER) {
      // Linear backoff for server errors
      return Math.min(baseDelay * (attempt + 1), maxDelay);
    }

    return baseDelay;
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Utility functions
export const handleError = (error: ApiError | Error): AppError => {
  return errorHandler.handleApiError(error);
};

export const isRetryableError = (error: AppError): boolean => {
  return errorHandler.shouldRetry(error);
};

export const getRetryDelay = (error: AppError, attempt: number): number => {
  return errorHandler.getRetryDelay(error, attempt);
}; 