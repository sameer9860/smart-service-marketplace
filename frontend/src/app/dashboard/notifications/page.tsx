"use client";

import React, { useEffect, useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { 
  Bell, Check, Trash2, 
  Clock, ArrowRight, BellOff,
  Inbox, Filter
} from 'lucide-react';
import api from '@/lib/api';

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/marketplace/notifications/');
      setNotifications(response.data.results || response.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await api.post(`/marketplace/notifications/${id}/mark_as_read/`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const clearAll = async () => {
      // In a real app, we'd have a bulk delete endpoint
      // For now, we'll just filter locally or implement bulk read
      alert("Clear all functionality would hit a bulk delete endpoint.");
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <DashboardSidebar />
      
      <main className="flex-grow p-12 overflow-y-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tighter">Notifications</h1>
            <p className="text-neutral-500 font-medium">Stay updated on your booking status and account activity.</p>
          </div>
          <div className="flex gap-4">
             <button 
                onClick={clearAll}
                className="px-6 py-3 bg-white/5 hover:bg-red-500/10 text-neutral-400 hover:text-red-500 font-bold rounded-xl transition-all border border-white/5 flex items-center gap-2"
             >
                <Trash2 className="w-4 h-4" />
                Clear All
             </button>
             <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Mark All as Read
             </button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-neutral-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-20 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/5">
              <BellOff className="w-10 h-10 text-neutral-600" />
            </div>
            <h2 className="text-3xl font-black mb-4">All Caught Up!</h2>
            <p className="text-neutral-500 max-w-md mb-8">You have no new notifications. We'll let you know when something important happens.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`group relative p-6 rounded-3xl border transition-all duration-300 flex items-start gap-6 ${
                  notification.is_read 
                    ? 'bg-neutral-900/20 border-white/5 opacity-60' 
                    : 'bg-neutral-900/60 border-blue-500/20 shadow-xl shadow-blue-500/5'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  notification.is_read ? 'bg-neutral-800 text-neutral-500' : 'bg-blue-600/10 text-blue-500 border border-blue-500/20'
                }`}>
                  <Bell className="w-6 h-6" />
                </div>
                
                <div className="flex-grow space-y-1">
                  <div className="flex justify-between items-start">
                    <p className={`font-bold leading-relaxed ${notification.is_read ? 'text-neutral-400' : 'text-white'}`}>
                      {notification.message}
                    </p>
                    <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest whitespace-nowrap ml-4">
                      {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                    <Clock className="w-3 h-3" />
                    {new Date(notification.created_at).toLocaleDateString()}
                  </div>
                </div>

                {!notification.is_read && (
                  <button 
                    onClick={() => markAsRead(notification.id)}
                    className="shrink-0 p-2 bg-blue-600/10 text-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-blue-500/20"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                
                <button className="shrink-0 p-2 hover:bg-red-500/10 text-neutral-700 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
