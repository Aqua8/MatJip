import { useState, useCallback } from 'react';

let _token = localStorage.getItem('token') || null;
let _nickname = localStorage.getItem('nickname') || null;
let _listeners = [];

const notify = () => _listeners.forEach((fn) => fn());

export function useAuth() {
  const [, rerender] = useState(0);

  const subscribe = useCallback(() => {
    const fn = () => rerender((n) => n + 1);
    _listeners.push(fn);
    return () => { _listeners = _listeners.filter((l) => l !== fn); };
  }, []);

  useState(subscribe);

  return {
    token: _token,
    nickname: _nickname,
    isLoggedIn: !!_token,
    login(token, nickname) {
      _token = token;
      _nickname = nickname;
      localStorage.setItem('token', token);
      localStorage.setItem('nickname', nickname);
      notify();
    },
    logout() {
      _token = null;
      _nickname = null;
      localStorage.removeItem('token');
      localStorage.removeItem('nickname');
      notify();
    },
  };
}
