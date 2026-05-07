"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import FilterSidebar from '@/components/FilterSidebar';
import { 
  Briefcase, Search, Filter as FilterIcon, 
  MapPin, Clock, DollarSign,
  ChevronRight, ArrowRight, Loader2,
  PlusCircle, Sparkles, User, X
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
  
  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '', // Will map to min_budget
    maxPrice: '', // Will map to max_budget
    sortBy: '-created_at'
  });

  const fetchJobs = async (query?: string, currentFilters?: any) => {
    setLoading(true);
    const activeFilters = currentFilters || filters;
    try {
      const params = new URLSearchParams();
      if (query || search) params.append('search', query || search);
      if (activeFilters.minPrice) params.append('min_budget', activeFilters.minPrice);
      if (activeFilters.maxPrice) params.append('max_budget', activeFilters.maxPrice);
      if (activeFilters.sortBy) params.append('ordering', activeFilters.sortBy);
      
      const response = await api.get(`/marketplace/jobs/?${params.toString()}`);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(search);
  };

  const clearFilters = () => {
    const defaultFilters = { minPrice: '', maxPrice: '', sortBy: '-created_at' };
    setFilters(defaultFilters);
    setSearch('');
    fetchJobs('', defaultFilters);
  };

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
            <div className="max-w-2xl text-left">
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

          <form onSubmit={handleSearch} className="relative group max-w-4xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by job title or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-2xl py-6 pl-14 pr-32 text-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-neutral-700 shadow-2xl"
            />
            <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-sm uppercase tracking-tighter transition-all active:scale-95 shadow-xl shadow-blue-600/20"
            >
                Search
            </button>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-32">
        <div className="flex flex-col lg:flex-row gap-12">
           {/* Sidebar */}
           <FilterSidebar 
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              filters={filters}
              setFilters={setFilters}
              onApply={() => fetchJobs()}
           />

           <div className="flex-grow space-y-8">
              {/* Controls */}
              <div className="flex items-center justify-between">
                 <button 
                   onClick={() => setIsFilterOpen(true)}
                   className="lg:hidden flex items-center gap-2 px-5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-white font-bold transition-all"
                 >
                   <FilterIcon className="w-4 h-4" />
                   Filters
                 </button>
                 
                 {(search || filters.minPrice || filters.maxPrice) && (
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Filtered View</span>
                      <button 
                        onClick={clearFilters}
                        className="flex items-center gap-1 text-red-500 text-xs font-bold hover:bg-red-500/10 px-3 py-1 rounded-full transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reset
                      </button>
                   </div>
                 )}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                  <p className="text-neutral-500 font-bold tracking-widest uppercase text-xs">Matching Opportunities...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-32 bg-neutral-900/20 border border-dashed border-white/10 rounded-[3rem]">
                   <Briefcase className="w-16 h-16 text-neutral-800 mx-auto mb-6" />
                   <h2 className="text-2xl font-black mb-2">No Jobs Found</h2>
                   <p className="text-neutral-500">Try adjusting your filters or search keywords.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {jobs.map((job) => (
                    <Link 
                      key={job.id} 
                      href={`/jobs/${job.id}`}
                      className="group bg-neutral-900/40 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem] hover:border-blue-500/30 transition-all duration-500 flex flex-col md:flex-row justify-between gap-8"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-blue-600/10 text-blue-500 text-[10px] font-black rounded-full border border-blue-500/20 uppercase tracking-widest">
                            {job.category_name || "General"}
                          </span>
                          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                            {new Date(job.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <h3 className="text-2xl font-black group-hover:text-blue-400 transition-colors tracking-tight">
                          {job.title}
                        </h3>
                        
                        <p className="text-neutral-500 line-clamp-2 font-medium leading-relaxed max-w-2xl">
                          {job.description}
                        </p>
                      </div>

                      <div className="flex flex-col items-end justify-between min-w-[200px]">
                        <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/5 px-4 py-2 rounded-2xl border border-emerald-500/20">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-xl font-black tracking-tighter">${job.budget}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 pt-4">
                          <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-widest">
                            <User className="w-4 h-4" />
                            {job.bids_count || 0} Bids
                          </div>
                          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                             <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
           </div>
        </div>
      </main>
    </div>
  );
}
