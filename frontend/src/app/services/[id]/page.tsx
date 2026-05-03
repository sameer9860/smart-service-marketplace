"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Star, User, Shield, Clock, CheckCircle, 
  ArrowLeft, Share2, Heart, MessageSquare,
  ShieldCheck, Award, Zap
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import BookingModal from '@/components/BookingModal';

interface Service {
  id: number;
  title: string;
  description: string;
  price: string;
  category_name: string;
  provider_email: string;
  avg_rating: number | null;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await api.get(`/marketplace/services/${params.id}/`);
        setService(response.data);
      } catch (error) {
        console.error('Failed to fetch service:', error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchService();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-4">Service Not Found</h1>
        <Link href="/" className="text-blue-500 hover:underline">Return to Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
      </div>

      <nav className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-neutral-400 hover:text-white">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-neutral-400 hover:text-pink-500">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Content */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="px-4 py-1.5 bg-blue-600/10 text-blue-500 text-xs font-bold rounded-full border border-blue-500/20 uppercase tracking-widest">
                  {service.category_name}
                </span>
                <div className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/5 px-3 py-1 rounded-full border border-yellow-500/10">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-bold">{service.avg_rating?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>
              <h1 className="text-5xl lg:text-6xl font-black mb-8 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">
                {service.title}
              </h1>
              
              <div className="flex flex-wrap gap-8 py-8 border-y border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase font-bold tracking-tighter">Identity</p>
                    <p className="text-sm font-medium text-white">Verified Provider</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase font-bold tracking-tighter">Quality</p>
                    <p className="text-sm font-medium text-white">Top Rated Service</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase font-bold tracking-tighter">Speed</p>
                    <p className="text-sm font-medium text-white">Fast Response</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="prose prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-blue-500" />
                About this service
              </h2>
              <p className="text-neutral-400 text-lg leading-relaxed whitespace-pre-wrap">
                {service.description}
              </p>
            </section>

            <section className="bg-neutral-900/40 backdrop-blur-md border border-white/5 p-8 rounded-3xl">
              <h3 className="text-xl font-bold mb-6">Service Guarantees</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  "Professional implementation",
                  "On-time delivery",
                  "24/7 Support for bookings",
                  "Money-back satisfaction guarantee"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-neutral-300">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              <div className="bg-neutral-900/60 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-500/5">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <span className="text-xs text-neutral-500 uppercase font-bold tracking-widest mb-1 block">Full Price</span>
                    <span className="text-5xl font-black text-white">${service.price}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full border border-emerald-500/20 uppercase">Available</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm text-neutral-400">
                    <Clock className="w-4 h-4" />
                    Delivery in 2-3 days
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-400">
                    <Shield className="w-4 h-4" />
                    Payment Protection
                  </div>
                </div>

                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-2xl transition-all duration-300 shadow-xl shadow-blue-600/20 active:scale-95"
                >
                  Book Now
                </button>
                
                <p className="text-center text-[10px] text-neutral-600 mt-6 uppercase font-bold tracking-widest">No hidden fees • Cancel anytime</p>
              </div>

              <div className="bg-white/5 border border-white/5 p-6 rounded-3xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
                    <User className="w-6 h-6 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase font-bold tracking-tighter">Provider</p>
                    <p className="text-sm font-bold text-white truncate max-w-[150px]">{service.provider_email}</p>
                  </div>
                </div>
                <button className="w-full py-3 border border-white/10 hover:bg-white/5 text-white text-sm font-bold rounded-xl transition-all">
                  Contact Provider
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {service && (
        <BookingModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          service={service} 
        />
      )}
    </div>
  );
}
