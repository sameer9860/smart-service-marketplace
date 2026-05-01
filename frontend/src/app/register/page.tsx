"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User, Briefcase, Loader2, Check } from 'lucide-react';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'customer' | 'provider'>('customer');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Logic will be added in Day 16 integration
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-lg z-10">
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
              <UserPlus className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-neutral-400 text-sm">Join the marketplace today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`relative p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                  role === 'customer' 
                  ? 'bg-blue-600/10 border-blue-500 text-blue-500' 
                  : 'bg-neutral-800/50 border-white/5 text-neutral-500 hover:border-white/10'
                }`}
              >
                <User className="w-6 h-6" />
                <span className="text-sm font-semibold">Customer</span>
                {role === 'customer' && <Check className="absolute top-2 right-2 w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setRole('provider')}
                className={`relative p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                  role === 'provider' 
                  ? 'bg-purple-600/10 border-purple-500 text-purple-500' 
                  : 'bg-neutral-800/50 border-white/5 text-neutral-500 hover:border-white/10'
                }`}
              >
                <Briefcase className="w-6 h-6" />
                <span className="text-sm font-semibold">Provider</span>
                {role === 'provider' && <Check className="absolute top-2 right-2 w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${role === 'customer' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-purple-600 hover:bg-purple-500'} disabled:opacity-50 text-white font-semibold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Create {role.charAt(0).toUpperCase() + role.slice(1)} Account</>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-neutral-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
