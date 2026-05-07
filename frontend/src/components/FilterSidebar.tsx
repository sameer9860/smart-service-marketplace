"use client";

import React from 'react';
import { 
  X, Filter, ChevronDown, 
  DollarSign, Star, Calendar,
  ArrowUpDown
} from 'lucide-react';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    minPrice: string;
    maxPrice: string;
    sortBy: string;
  };
  setFilters: (filters: any) => void;
  onApply: () => void;
}

export default function FilterSidebar({ 
  isOpen, onClose, filters, setFilters, onApply 
}: FilterSidebarProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 right-0 h-full w-80 bg-neutral-900 border-l border-white/10 z-[70] transform transition-transform duration-500 ease-in-out p-8 overflow-y-auto
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:static lg:w-72 lg:h-auto lg:bg-transparent lg:border-none lg:p-0'}
      `}>
        <div className="flex items-center justify-between mb-8 lg:hidden">
          <h2 className="text-xl font-black">Filters</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-10">
          {/* Sorting */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
              <ArrowUpDown className="w-3 h-3" />
              Sort By
            </label>
            <div className="relative group">
              <select 
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full bg-neutral-800/50 border border-white/5 rounded-2xl p-4 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold text-sm"
              >
                <option value="-created_at">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-avg_rating">Top Rated</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none group-hover:text-white transition-colors" />
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
              <DollarSign className="w-3 h-3" />
              Price Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <input 
                  type="number" 
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full bg-neutral-800/50 border border-white/5 rounded-xl p-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div className="space-y-2">
                <input 
                  type="number" 
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full bg-neutral-800/50 border border-white/5 rounded-xl p-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
          </div>

          {/* Apply Button (Visible only on mobile/tablet) */}
          <button 
            onClick={() => {
                onApply();
                onClose();
            }}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all lg:hidden"
          >
            Apply Filters
          </button>
          
          <button 
            onClick={onApply}
            className="hidden lg:flex w-full py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl border border-white/5 transition-all items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Update Results
          </button>
        </div>

        {/* Pro Tip */}
        <div className="mt-12 p-6 bg-blue-600/5 border border-blue-500/10 rounded-[2rem]">
           <div className="flex items-center gap-3 mb-3 text-blue-500">
             <Star className="w-4 h-4 fill-current" />
             <span className="text-[10px] font-black uppercase tracking-widest">Pro Tip</span>
           </div>
           <p className="text-xs text-neutral-500 leading-relaxed font-medium">
             Sorting by "Top Rated" helps you find the most reliable professionals in our community.
           </p>
        </div>
      </aside>
    </>
  );
}
