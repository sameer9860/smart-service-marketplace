"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import ServiceCard from '@/components/ServiceCard';
import { Search, Filter, Loader2, Sparkles, SlidersHorizontal } from 'lucide-react';

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

  const fetchServices = async (categoryId?: number, query?: string) => {
    setLoading(true);
    try {
      let url = '/marketplace/services/';
      const params = new URLSearchParams();
      if (categoryId) params.append('category', categoryId.toString());
      if (query) params.append('search', query); // Assuming backend search is implemented or handled by DRF filter
      
      const response = await api.get(`${url}?${params.toString()}`);
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

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Hero Section */}
      <div className="relative pt-24 pb-16 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] opacity-50"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] opacity-50"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-blue-400 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Discover Top-Rated Professionals</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
            Find the Perfect Service <br /> for Your Next Project
          </h1>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="What service are you looking for?"
              className="w-full bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-12 pr-32 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-lg shadow-2xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-600/20"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-24">
        {/* Category Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => handleCategorySelect(null)}
              className={`px-5 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === null 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'bg-white/5 hover:bg-white/10 text-neutral-400'
              }`}
            >
              All Services
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`px-5 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === category.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'bg-white/5 hover:bg-white/10 text-neutral-400'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-white/5 rounded-xl text-neutral-400 hover:text-white transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            <span>More Filters</span>
          </button>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="text-neutral-500 font-medium">Curating the best services for you...</p>
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-neutral-900/20 border border-dashed border-white/10 rounded-3xl">
            <p className="text-neutral-500 text-lg italic">No services found matching your criteria.</p>
            <button 
              onClick={() => handleCategorySelect(null)}
              className="mt-4 text-blue-500 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
