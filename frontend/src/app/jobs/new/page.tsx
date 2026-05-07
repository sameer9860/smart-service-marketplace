"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { 
  PlusCircle, Layout, FileText, 
  DollarSign, Send, ArrowLeft,
  Loader2, Sparkles, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface Category {
  id: number;
  name: string;
}

export default function PostJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    category: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/marketplace/categories/');
        setCategories(response.data.results || response.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();

    // Guard: Only logged in users can post
    const token = localStorage.getItem('token');
    if (!token) router.push('/login?redirect=/jobs/new');
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/marketplace/jobs/', formData);
      router.push('/dashboard/customer?job_posted=true');
    } catch (err) {
      console.error("Failed to post job", err);
      alert("Failed to post job. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <Link 
          href="/jobs"
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Marketplace
        </Link>

        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" />
            Hire the Best Talent
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">Post a <span className="text-blue-500">New Request</span></h1>
          <p className="text-neutral-500 text-lg font-medium">Describe your project and receive competitive bids from top-rated providers.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Left: Basics */}
             <div className="space-y-8 bg-neutral-900/40 backdrop-blur-md border border-white/5 p-8 rounded-[2rem]">
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-neutral-400">
                    <Layout className="w-4 h-4" />
                    Job Category
                  </label>
                  <select 
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none text-white"
                  >
                    <option value="">Select a Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-neutral-400">
                    <DollarSign className="w-4 h-4" />
                    Estimated Budget ($)
                  </label>
                  <input 
                    type="number" 
                    required
                    placeholder="e.g. 500"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-white placeholder:text-neutral-700"
                  />
                </div>
             </div>

             {/* Right: Details */}
             <div className="space-y-8 bg-neutral-900/40 backdrop-blur-md border border-white/5 p-8 rounded-[2rem]">
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-neutral-400">
                    <FileText className="w-4 h-4" />
                    Project Title
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Modern E-commerce Website Design"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-white placeholder:text-neutral-700"
                  />
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-neutral-400">
                    <FileText className="w-4 h-4" />
                    Detailed Requirements
                  </label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Describe exactly what you need..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-white placeholder:text-neutral-700 resize-none"
                  />
                </div>
             </div>
          </div>

          <div className="bg-blue-600/5 border border-blue-500/10 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Ready to publish?</p>
                <p className="text-sm text-neutral-500">Your job will be visible to all verified providers.</p>
              </div>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-12 py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 active:scale-95"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-5 h-5" />}
              Publish Job Request
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
