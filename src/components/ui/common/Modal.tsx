import { Fragment, memo, useCallback, type ReactNode } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { type ComponentProps } from '@/types/global';

interface ModalProps extends ComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  children: ReactNode;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl',
} as const;

const ModalComponent = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  showCloseButton = true,
  children,
  className = '',
}: ModalProps) => {
  // Memoize the close handler to prevent unnecessary re-renders
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" style={{ zIndex: 99999 }} onClose={handleClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" style={{ zIndex: 99998 }} />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 99999 }}>
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel 
                className={`w-full ${sizeClasses[size]} transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all ${className}`}
              >
                {/* Header */}
                {(title || showCloseButton) && (
                  <div className="flex items-center justify-between mb-4">
                    {title && (
                      <DialogTitle 
                        as="h3" 
                        className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                      >
                        {title}
                      </DialogTitle>
                    )}
                    
                    {showCloseButton && (
                      <button
                        type="button"
                        className="rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        onClick={handleClose}
                        aria-label="Close modal"
                      >
                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="mt-2">
                  {children}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// Memoized component for better performance
export const Modal = memo(ModalComponent);
Modal.displayName = 'Modal'; 