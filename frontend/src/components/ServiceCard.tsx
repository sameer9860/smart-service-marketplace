"use client";

import React from 'react';
import { Star, User, Clock, ChevronRight } from 'lucide-react';

interface ServiceCardProps {
  service: {
    id: number;
    title: string;
    description: string;
    price: string;
    category_name: string;
    provider_email: string;
    avg_rating: number | null;
  };
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="group bg-neutral-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col h-full">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <span className="px-3 py-1 bg-blue-600/10 text-blue-500 text-xs font-semibold rounded-full border border-blue-500/20">
            {service.category_name}
          </span>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">{service.avg_rating?.toFixed(1) || 'N/A'}</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">
          {service.title}
        </h3>
        <p className="text-neutral-400 text-sm line-clamp-2 mb-4 leading-relaxed">
          {service.description}
        </p>

        <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-auto">
          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
            <User className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-neutral-500">Provider</span>
            <span className="text-xs text-neutral-300 font-medium truncate max-w-[120px]">
              {service.provider_email}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0">
        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-col">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Starting at</span>
            <span className="text-2xl font-bold text-white">${service.price}</span>
          </div>
          <button className="bg-white/5 hover:bg-blue-600 text-white p-3 rounded-xl transition-all duration-300 group/btn">
            <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
