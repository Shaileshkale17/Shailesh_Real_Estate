import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

export function useFetch(path) {
  const [state, set] = useState({ data: null, error: null, loading: true });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    set((s) => ({ ...s, loading: true, error: null }));
    api(path).then((data) => live && set({ data, error: null, loading: false }), (error) => live && set({ data: null, error, loading: false }));
    return () => { live = false; };
  }, [path, tick]);
  return { ...state, retry: useCallback(() => setTick((t) => t + 1), []) };
}
