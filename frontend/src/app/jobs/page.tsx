"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { 
  Briefcase, Search, Filter, 
  MapPin, Clock, DollarSign,
  ChevronRight, ArrowRight, Loader2,
  PlusCircle, Sparkles, User
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface Job {
  id: number;
  title: string;
  description: string;
  budget: string;
  status: string;
  created_at: string;
  customer_email: string;
  category_name: string;
  bids_count?: number;
}

export default function JobMarketplacePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchJobs = async () => {
    try {
      const response = await api.get('/marketplace/jobs/');
      setJobs(response.data.results || response.data);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">
                <Sparkles className="w-3 h-3" />
                Community Requests
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-none">
                Open <span className="text-blue-500">Service</span> <br /> Requests
              </h1>
              <p className="text-neutral-500 text-lg font-medium leading-relaxed">
                Browse custom job posts from customers looking for specialized skills. Submit your bid and start working today.
              </p>
            </div>
            <Link 
              href="/jobs/new"
              className="group flex items-center gap-3 px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95"
            >
              <PlusCircle className="w-5 h-5" />
              Post a Job Request
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by job title or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] py-6 pl-14 pr-8 text-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-neutral-700 shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-neutral-500 font-bold tracking-widest uppercase text-xs">Fetching Opportunities...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-32 bg-neutral-900/20 border border-dashed border-white/10 rounded-[3rem]">
             <Briefcase className="w-16 h-16 text-neutral-800 mx-auto mb-6" />
             <h2 className="text-2xl font-black mb-2">No Open Jobs Found</h2>
             <p className="text-neutral-500">Be the first to post a custom request or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <Link 
                key={job.id} 
                href={`/jobs/${job.id}`}
                className="group bg-neutral-900/40 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem] hover:border-blue-500/30 transition-all duration-500 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-3 py-1 bg-blue-600/10 text-blue-500 text-[10px] font-black rounded-full border border-blue-500/20 uppercase tracking-widest">
                      {job.category_name || "General"}
                    </span>
                    <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/20">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span className="text-xs font-black uppercase tracking-tighter">Budget ${job.budget}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-black mb-4 group-hover:text-blue-400 transition-colors tracking-tight">
                    {job.title}
                  </h3>
                  
                  <p className="text-neutral-500 line-clamp-2 mb-8 font-medium leading-relaxed">
                    {job.description}
                  </p>
                </div>

                <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                       {[1, 2, 3].map((i) => (
                         <div key={i} className="w-8 h-8 rounded-full bg-neutral-800 border-2 border-black flex items-center justify-center text-[10px] font-bold">
                           <User className="w-4 h-4 text-neutral-500" />
                         </div>
                       ))}
                    </div>
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                      {job.bids_count || 0} Bids Received
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-500 font-black text-sm uppercase tracking-tighter group-hover:gap-4 transition-all">
                    View Details
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
