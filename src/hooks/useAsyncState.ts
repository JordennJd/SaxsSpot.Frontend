import { useState, useCallback } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseAsyncStateReturn<T> extends AsyncState<T> {
  execute: (asyncFn: () => Promise<T>) => Promise<void>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export function useAsyncState<T = unknown>(
  initialData: T | null = null,
): UseAsyncStateReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await asyncFn();
      setState(prev => ({ ...prev, data: result, loading: false }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setState(prev => ({ ...prev, error: message, loading: false }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: initialData, loading: false, error: null });
  }, [initialData]);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
    setLoading,
  };
} 