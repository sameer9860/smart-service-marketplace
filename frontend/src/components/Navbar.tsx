"use client";

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, role, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
            <ShoppingBag className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-black text-white tracking-tighter uppercase">Smart<span className="text-blue-500">Market</span></span>
        </Link>

        <div className="flex items-center gap-8">
          <Link href="/" className="text-sm font-bold text-neutral-400 hover:text-white transition-colors">Explore</Link>
          <Link href="/services" className="text-sm font-bold text-neutral-400 hover:text-white transition-colors">Services</Link>
          
          <div className="h-6 w-px bg-white/10 mx-2"></div>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link 
                href={role === 'provider' ? '/dashboard/provider' : '/dashboard/customer'}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black rounded-xl transition-all shadow-lg shadow-blue-600/20"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <button 
                onClick={logout}
                className="p-2.5 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="px-6 py-2.5 text-sm font-bold text-white hover:bg-white/5 rounded-xl transition-all"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="px-6 py-2.5 bg-white text-black text-sm font-black rounded-xl hover:bg-neutral-200 transition-all shadow-xl"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
