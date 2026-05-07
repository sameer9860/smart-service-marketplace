"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import ServiceCard from '@/components/ServiceCard';
import Navbar from '@/components/Navbar';
import FilterSidebar from '@/components/FilterSidebar';
import { Search, Filter as FilterIcon, Loader2, Sparkles, X } from 'lucide-react';

interface Service {
  id: number;
  title: string;
  description: string;
  price: string;
  category_name: string;
  provider_email: string;
  avg_rating: number | null;
}

interface Category {
  id: number;
  name: string;
}

export default function MarketplacePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    sortBy: '-created_at'
  });

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/marketplace/categories/');
      setCategories(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchServices = async (categoryId?: number, query?: string, currentFilters?: any) => {
    setLoading(true);
    const activeFilters = currentFilters || filters;
    try {
      const params = new URLSearchParams();
      if (categoryId || selectedCategory) params.append('category', (categoryId || selectedCategory!).toString());
      if (query || search) params.append('search', query || search);
      if (activeFilters.minPrice) params.append('min_price', activeFilters.minPrice);
      if (activeFilters.maxPrice) params.append('max_price', activeFilters.maxPrice);
      if (activeFilters.sortBy) params.append('ordering', activeFilters.sortBy);
      
      const response = await api.get(`/marketplace/services/?${params.toString()}`);
      setServices(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchServices(selectedCategory || undefined, search);
  };

  const handleCategorySelect = (id: number | null) => {
    setSelectedCategory(id);
    fetchServices(id || undefined, search);
  };

  const clearFilters = () => {
    const defaultFilters = { minPrice: '', maxPrice: '', sortBy: '-created_at' };
    setFilters(defaultFilters);
    setSelectedCategory(null);
    setSearch('');
    fetchServices(undefined, '', defaultFilters);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-blue-500/30">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] opacity-50 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] opacity-50 animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" />
            <span>Discover Top-Rated Professionals</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter leading-none">
            Service <br /> <span className="text-blue-500">Marketplace</span>
          </h1>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="What service are you looking for?"
              className="w-full bg-neutral-900/40 backdrop-blur-xl border border-white/10 rounded-2xl py-5 pl-14 pr-32 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-lg shadow-2xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl font-black text-sm uppercase tracking-tighter transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Filters Sidebar */}
          <FilterSidebar 
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            filters={filters}
            setFilters={setFilters}
            onApply={() => fetchServices()}
          />

          <div className="flex-grow space-y-10">
            {/* Category Navigation & Mobile Filter Toggle */}
            <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4 no-scrollbar">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCategorySelect(null)}
                  className={`px-6 py-2.5 rounded-xl whitespace-nowrap transition-all font-bold text-sm border ${
                    selectedCategory === null 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                    : 'bg-white/5 border-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  All Services
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`px-6 py-2.5 rounded-xl whitespace-nowrap transition-all font-bold text-sm border ${
                      selectedCategory === category.id 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-white/5 border-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-white font-bold transition-all active:scale-95"
              >
                <FilterIcon className="w-4 h-4" />
                Filters
              </button>
            </div>

            {/* Active Filters Display */}
            {(filters.minPrice || filters.maxPrice || selectedCategory || search) && (
              <div className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mr-2">Active Filters:</span>
                {search && (
                  <span className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full text-xs text-neutral-300">
                    "{search}"
                  </span>
                )}
                {selectedCategory && (
                  <span className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-400">
                    {categories.find(c => c.id === selectedCategory)?.name}
                  </span>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <span className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-500">
                    ${filters.minPrice || '0'} - ${filters.maxPrice || '∞'}
                  </span>
                )}
                <button 
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-1 text-red-500 hover:bg-red-500/10 rounded-full transition-all text-xs font-bold"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear All
                </button>
              </div>
            )}

            {/* Services Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 4, 5].map(i => (
                  <div key={i} className="h-[400px] bg-neutral-900/40 rounded-[2.5rem] animate-pulse border border-white/5" />
                ))}
              </div>
            ) : services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-neutral-900/20 border border-dashed border-white/10 rounded-[3rem]">
                <p className="text-neutral-500 text-lg font-bold mb-4">No services match your criteria.</p>
                <button 
                  onClick={clearFilters}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all shadow-xl shadow-blue-600/20"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
