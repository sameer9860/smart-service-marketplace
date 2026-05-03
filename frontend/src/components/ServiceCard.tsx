"use client";

import React from 'react';
import { Star, User, ExternalLink } from 'lucide-react';
import Link from 'next/link';

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

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
              <User className="w-4 h-4 text-neutral-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-neutral-500 uppercase">Provider</span>
              <span className="text-xs text-neutral-300 font-medium truncate max-w-[100px]">
                {service.provider_email}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="block text-[10px] text-neutral-500 uppercase">Starting at</span>
            <span className="text-lg font-bold text-white">${service.price}</span>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0 mt-auto">
        <Link 
          href={`/services/${service.id}`}
          className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
        >
          View Details
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
