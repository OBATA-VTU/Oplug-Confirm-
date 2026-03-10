import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export function useInactivityLogout() {
  const { user, logout } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (user) {
      timeoutRef.current = setTimeout(() => {
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  };

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    if (user) {
      resetTimer();
      events.forEach(event => {
        window.addEventListener(event, resetTimer);
      });
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);
}
