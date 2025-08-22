import { memo } from 'react';
import { type ComponentProps } from '@/types/global';

interface LoadingSpinnerProps extends ComponentProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8', 
  lg: 'h-12 w-12',
} as const;

const LoadingSpinnerComponent = ({ 
  size = 'md', 
  text, 
  fullScreen = false,
  className = '',
}: LoadingSpinnerProps) => {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div 
        className={`${sizeClasses[size]} border-4 border-blue-500 border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

// Memoized component for better performance
export const LoadingSpinner = memo(LoadingSpinnerComponent);
LoadingSpinner.displayName = 'LoadingSpinner'; 