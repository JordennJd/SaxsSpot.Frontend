import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { NanosystemViewer3D } from './NanosystemViewer3D';
import type { NanosystemDto } from '../nanosystems/api/nanosystemTypes';

interface NanosystemViewer3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  nanosystem: NanosystemDto | null;
}

export function NanosystemViewer3DModal({ isOpen, onClose, nanosystem }: NanosystemViewer3DModalProps) {
  const particleKind = nanosystem?.particleKind === 'Parallelepiped' ? 1 : 0;

  const [inputSkip, setInputSkip] = useState(0);
  const [inputTake, setInputTake] = useState(10000);
  const [appliedSkip, setAppliedSkip] = useState(0);
  const [appliedTake, setAppliedTake] = useState(10000);

  const handleLoad = () => {
    setAppliedSkip(inputSkip);
    setAppliedTake(inputTake);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} style={{ zIndex: 99999 }}>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" style={{ zIndex: 99998 }} aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
        <Dialog.Panel className="w-full max-w-5xl rounded-xl bg-white shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-200 bg-gray-50">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              3D System View {nanosystem ? `· ${nanosystem.particleKind}` : ''}
            </Dialog.Title>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                Skip
                <input
                  type="number"
                  min={0}
                  value={inputSkip}
                  onChange={(e) => setInputSkip(Number(e.target.value) || 0)}
                  className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                Take
                <input
                  type="number"
                  min={1}
                  value={inputTake}
                  onChange={(e) => setInputTake(Number(e.target.value) || 1)}
                  className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
                />
              </label>
              <button
                type="button"
                onClick={handleLoad}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Load
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 min-h-0 p-4">
            {isOpen && nanosystem ? (
              <NanosystemViewer3D
                key={`${nanosystem.id}-${appliedSkip}-${appliedTake}`}
                nanosystemId={nanosystem.id}
                particleKind={particleKind}
                skip={appliedSkip}
                take={appliedTake}
                className="h-full min-h-[420px]"
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No nanosystem selected
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
