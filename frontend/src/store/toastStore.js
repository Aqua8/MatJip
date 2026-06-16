import { useState, useCallback } from 'react';

let _toasts = [];
let _listeners = [];
let _nextId = 0;

const notify = () => _listeners.forEach((fn) => fn());

export function toast(message, type = 'error') {
  const id = ++_nextId;
  _toasts = [..._toasts, { id, message, type }];
  notify();
  setTimeout(() => {
    _toasts = _toasts.filter((t) => t.id !== id);
    notify();
  }, 3000);
}

export function useToasts() {
  const [, rerender] = useState(0);
  const subscribe = useCallback(() => {
    const fn = () => rerender((n) => n + 1);
    _listeners.push(fn);
    return () => { _listeners = _listeners.filter((l) => l !== fn); };
  }, []);
  useState(subscribe);
  return _toasts;
}
