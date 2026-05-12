"use client";

import React, { useState, useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { 
  Settings, Lock, Shield, 
  History, Eye, EyeOff, 
  Loader2, CheckCircle2, AlertCircle,
  Clock, Globe, Monitor
} from 'lucide-react';
import api from '@/lib/api';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [fetchingLogs, setFetchingLogs] = useState(true);

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/accounts/activity-logs/');
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setFetchingLogs(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post('/accounts/password/change/', passwordData);
      setSuccess("Password updated successfully!");
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      fetchLogs(); // Refresh logs to show the change
    } catch (err: any) {
      const data = err.response?.data;
      setError(data?.old_password?.[0] || data?.confirm_password?.[0] || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-950 text-white">
      <DashboardSidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/20">
              <Settings className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Account Settings</h1>
              <p className="text-neutral-400 text-sm">Manage your security and track your activity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Security Section */}
            <div className="md:col-span-2 space-y-6">
              <section className="bg-neutral-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-bold">Change Password</h2>
                </div>

                {success && (
                  <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-500 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">{success}</span>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-neutral-500 uppercase tracking-widest ml-1">Current Password</label>
                    <div className="relative">
                      <input 
                        type={showOldPassword ? "text" : "password"}
                        required
                        className="w-full bg-black/50 border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                        value={passwordData.old_password}
                        onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                      >
                        {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-neutral-500 uppercase tracking-widest ml-1">New Password</label>
                      <div className="relative">
                        <input 
                          type={showNewPassword ? "text" : "password"}
                          required
                          className="w-full bg-black/50 border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-neutral-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                      <div className="relative">
                        <input 
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          className="w-full bg-black/50 border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
                  </button>
                </form>
              </section>

              {/* Activity Log */}
              <section className="bg-neutral-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-blue-500" />
                    <h2 className="text-xl font-bold">Activity Log</h2>
                  </div>
                  <button onClick={fetchLogs} className="text-xs text-blue-500 hover:text-blue-400 font-bold">Refresh</button>
                </div>

                <div className="space-y-4">
                  {fetchingLogs ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                  ) : logs.length > 0 ? (
                    logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-4 p-4 bg-black/30 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center shrink-0 group-hover:bg-blue-600/10 transition-colors">
                          <Shield className="w-5 h-5 text-neutral-400 group-hover:text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white mb-1">{log.action}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            <span className="flex items-center gap-1.5 text-[10px] text-neutral-500">
                              <Clock className="w-3 h-3" />
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] text-neutral-500">
                              <Globe className="w-3 h-3" />
                              {log.ip_address || "Unknown IP"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-neutral-500 bg-black/20 rounded-2xl border border-dashed border-white/5">
                      No activity logs found
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Sidebar info */}
            <div className="space-y-6">
              <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-6">
                <h3 className="text-blue-500 font-black text-xs uppercase tracking-widest mb-3">Security Tip</h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Always use a strong, unique password. Enable two-factor authentication for an extra layer of protection.
                </p>
              </div>

              <div className="bg-neutral-900/50 border border-white/5 rounded-3xl p-6">
                <h3 className="text-neutral-500 font-black text-xs uppercase tracking-widest mb-4">Device Sessions</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <Monitor className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold">Current Session</p>
                      <p className="text-[10px] text-neutral-500">Active Now</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
