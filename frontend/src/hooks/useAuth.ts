"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [user, setUser] = useState<{ role: string | null; isAuthenticated: boolean }>({
    role: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('user_role');

    if (token) {
      setUser({
        role: role,
        isAuthenticated: true,
      });
    } else {
      setUser({
        role: null,
        isAuthenticated: false,
      });
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    setUser({ role: null, isAuthenticated: false });
    router.push('/login');
  };

  return { ...user, loading, logout };
}
