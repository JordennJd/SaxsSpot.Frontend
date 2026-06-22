import { Dialog } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { NanosystemDetailsView } from './NanosystemDetailsView';
import type { NanosystemDetailsViewProps } from './NanosystemDetailsView';
import { openNanosystemInNewWindow } from '@/lib/navigation';

interface NanosystemDetailsModalProps extends Omit<NanosystemDetailsViewProps, 'layout' | 'showFooterActions' | 'headerExtra' | 'onClose'> {
  isOpen: boolean;
  onClose: () => void;
  seriesId: string;
}

export const NanosystemDetailsModal = ({
  isOpen,
  onClose,
  seriesId,
  nanosystem,
  ...viewProps
}: NanosystemDetailsModalProps) => {
  if (!nanosystem) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} style={{ zIndex: 99999 }}>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" style={{ zIndex: 99998 }} aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
        <Dialog.Panel className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
          <NanosystemDetailsView
            nanosystem={nanosystem}
            layout="modal"
            onClose={onClose}
            headerExtra={
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/series/${seriesId}/nanosystems/${nanosystem.id}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="Open workspace"
                >
                  Workspace
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    openNanosystemInNewWindow(seriesId, nanosystem.id);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="Open in new window"
                >
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  New window
                </button>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            }
            {...viewProps}
          />
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
