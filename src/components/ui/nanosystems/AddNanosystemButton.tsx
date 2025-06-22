// src/components/ui/nanosystems/AddNanosystemButton.tsx
import React, { useState } from 'react';
import { PlusCircleIcon } from '@heroicons/react/20/solid';
import { useNavigate } from 'react-router-dom';

export const AddNanosystemButton = () => {
  const navigate = useNavigate();

  return (
    <>
      <button
      onClick={() => navigate('/new')}
      className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
        title="Add new nanosystem"
      >
        <PlusCircleIcon className="h-5 w-5" />
      </button>
    </>
  );
};