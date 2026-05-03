"use client";

import React, { useEffect, useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { 
  TrendingUp, Users, ShoppingCart, 
  DollarSign, ArrowUpRight, Clock,
  MoreVertical, CheckCircle2, XCircle
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface Stats {
  total_earnings: number;
  active_services: number;
  pending_bookings: number;
  total_customers: number;
}

interface RecentBooking {
  id: number;
  user_email: string;
  service_title: string;
  status: string;
  created_at: string;
}

export default function ProviderDashboard() {
  const [stats, setStats] = useState<Stats>({
    total_earnings: 0,
    active_services: 0,
    pending_bookings: 0,
    total_customers: 0
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, these would be dedicated dashboard endpoints
        const [servicesRes, bookingsRes] = await [
           api.get('/marketplace/services/'), // Filtered by provider on backend in real scenario
           api.get('/marketplace/bookings/')
        ];
        
        // Mocking some stats for visual representation if actual endpoints aren't specialized yet
        setStats({
          total_earnings: 1250.00,
          active_services: 5,
          pending_bookings: 3,
          total_customers: 12
        });
        
        // We'll set recent bookings from the API response
        // setRecentBookings(bookingsRes.data.results.slice(0, 5));
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const StatCard = ({ icon, label, value, trend, color }: any) => (
    <div className="bg-neutral-900/40 backdrop-blur-md border border-white/5 p-8 rounded-3xl group hover:border-blue-500/30 transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-500 border border-${color.split('-')[1]}-500/20`}>
          {icon}
        </div>
        <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded-full text-xs font-bold border border-emerald-500/10">
          <ArrowUpRight className="w-3 h-3" />
          {trend}
        </div>
      </div>
      <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-4xl font-black text-white">{value}</h3>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-black text-white">
      <DashboardSidebar />
      
      <main className="flex-grow p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tighter">Provider Dashboard</h1>
            <p className="text-neutral-500 font-medium">Welcome back! Here's what's happening with your business today.</p>
          </div>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
            View Analytics
            <TrendingUp className="w-4 h-4" />
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <StatCard 
            icon={<DollarSign className="w-6 h-6" />} 
            label="Total Revenue" 
            value={`$${stats.total_earnings}`} 
            trend="+12%" 
            color="bg-emerald-500"
          />
          <StatCard 
            icon={<ShoppingCart className="w-6 h-6" />} 
            label="Total Bookings" 
            value="48" 
            trend="+5%" 
            color="bg-blue-500"
          />
          <StatCard 
            icon={<Users className="w-6 h-6" />} 
            label="New Customers" 
            value={stats.total_customers} 
            trend="+18%" 
            color="bg-purple-500"
          />
          <StatCard 
            icon={<Clock className="w-6 h-6" />} 
            label="Pending Work" 
            value={stats.pending_bookings} 
            trend="-2%" 
            color="bg-orange-500"
          />
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-neutral-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden">
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-2xl font-black tracking-tight">Recent Bookings</h2>
                <button className="text-sm font-bold text-blue-500 hover:text-blue-400">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-neutral-500 text-[10px] font-black uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-4">Client</th>
                      <th className="px-8 py-4">Service</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4">Date</th>
                      <th className="px-8 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="group hover:bg-white/5 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-400">
                              JD
                            </div>
                            <span className="text-sm font-bold text-white">john.doe@example.com</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-sm text-neutral-300 font-medium">Home Cleaning Pro</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black rounded-full border border-blue-500/20 uppercase tracking-tighter">
                            In Progress
                          </span>
                        </td>
                        <td className="px-8 py-6 text-sm text-neutral-500 font-medium">
                          May 2, 2026
                        </td>
                        <td className="px-8 py-6">
                          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-neutral-500 hover:text-white">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-8">
             <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-[2rem] shadow-xl shadow-blue-600/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Expand Your Reach</h3>
                <p className="text-blue-100 text-sm mb-8 leading-relaxed">Listing more services increases your visibility by up to 40%.</p>
                <Link 
                  href="/dashboard/provider/services/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-black rounded-xl hover:bg-blue-50 hover:scale-105 transition-all shadow-lg"
                >
                  Create New Service
                </Link>
             </div>

             <div className="bg-neutral-900/40 backdrop-blur-md border border-white/5 p-8 rounded-[2rem]">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Quick Actions
                </h3>
                <div className="space-y-4">
                  <button className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all text-left flex items-center justify-between group">
                    View Monthly Report
                    <ArrowUpRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors" />
                  </button>
                  <button className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all text-left flex items-center justify-between group">
                    Manage Schedule
                    <ArrowUpRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors" />
                  </button>
                  <button className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 text-red-500 font-bold rounded-2xl transition-all text-left flex items-center justify-between group border border-transparent hover:border-red-500/20">
                    Withdraw Funds
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
