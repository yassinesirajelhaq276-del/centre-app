import { useEffect, useState, useCallback } from 'react';

type RouteListener = (path: string) => void;

function getPath() {
  return window.location.pathname || '/';
}

const listeners = new Set<RouteListener>();

export function navigate(to: string) {
  if (getPath() === to) return;
  window.history.pushState({}, '', to);
  listeners.forEach((l) => l(to));
  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
}

export function useRoute(): string {
  const [path, setPath] = useState<string>(getPath());

  useEffect(() => {
    const onChange = (next: string) => setPath(next);
    listeners.add(onChange);
    const onPop = () => setPath(getPath());
    window.addEventListener('popstate', onPop);
    return () => {
      listeners.delete(onChange);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  return path;
}

export function useToast() {
  const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'error' } | null>(null);

  const show = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ id: Date.now(), message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  return { toast, show };
}
