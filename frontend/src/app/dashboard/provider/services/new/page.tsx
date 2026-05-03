"use client";

import React, { useState, useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { 
  ArrowLeft, Save, Plus, 
  DollarSign, Tag, FileText, 
  Sparkles, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Category {
  id: number;
  name: string;
}

export default function NewServicePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: ''
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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/marketplace/services/', formData);
      setSuccess(true);
      setTimeout(() => router.push('/dashboard/provider'), 2000);
    } catch (err: any) {
      console.error("Failed to create service", err);
      setError(err.response?.data?.detail || "Failed to create service. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <DashboardSidebar />
      
      <main className="flex-grow p-12 overflow-y-auto">
        <header className="mb-12">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black mb-2 tracking-tighter">Create New Service</h1>
              <p className="text-neutral-500 font-medium">Define your offering and reach thousands of customers.</p>
            </div>
            <div className="flex items-center gap-4">
               <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">Draft Saved</span>
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-neutral-900/40 backdrop-blur-md border border-white/5 p-10 rounded-[2.5rem] space-y-8">
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm font-bold text-neutral-400 uppercase tracking-widest">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    Service Title
                  </label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g., Professional Home Deep Cleaning"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white placeholder:text-neutral-700 focus:outline-none focus:border-blue-500/50 transition-all text-xl font-bold"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-neutral-400 uppercase tracking-widest">
                      <Tag className="w-4 h-4 text-purple-500" />
                      Category
                    </label>
                    <select 
                      required
                      className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-neutral-400 uppercase tracking-widest">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      Starting Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">$</span>
                      <input 
                        required
                        type="number"
                        placeholder="0.00"
                        className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 pl-8 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm font-bold text-neutral-400 uppercase tracking-widest">
                    <FileText className="w-4 h-4 text-orange-500" />
                    Description
                  </label>
                  <textarea 
                    required
                    rows={6}
                    placeholder="Describe your service in detail... What's included? What's your process?"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white placeholder:text-neutral-700 focus:outline-none focus:border-blue-500/50 transition-all resize-none leading-relaxed"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm animate-in shake-1">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-500 text-sm animate-in slide-in-from-bottom-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  Service created successfully! Redirecting...
                </div>
              )}

              <div className="flex gap-4">
                 <button 
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
                >
                  Discard Changes
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Publish Service
                      <Plus className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar / Preview Section */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-neutral-900/60 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] sticky top-32">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                Live Preview
              </h3>
              <div className="bg-black/40 border border-white/5 rounded-3xl overflow-hidden group">
                <div className="h-40 bg-neutral-800 flex items-center justify-center text-neutral-600">
                   Image Preview Placeholder
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-blue-600/10 text-blue-500 text-[10px] font-bold rounded-full border border-blue-500/20 uppercase tracking-widest">
                      {categories.find(c => c.id.toString() === formData.category)?.name || "Category"}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2 line-clamp-1">{formData.title || "Your Service Title"}</h4>
                  <p className="text-neutral-500 text-xs line-clamp-2 mb-4 leading-relaxed">
                    {formData.description || "Service description will appear here..."}
                  </p>
                  <div className="flex justify-between items-end pt-4 border-t border-white/5">
                    <div>
                      <span className="block text-[10px] text-neutral-600 uppercase font-bold tracking-tighter">Starting at</span>
                      <span className="text-xl font-black text-white">${formData.price || "0"}</span>
                    </div>
                    <button className="p-2 bg-blue-600 rounded-lg text-white">
                       <ArrowLeft className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                 <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    Visible to all customers instantly
                 </div>
                 <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    Secure payments enabled
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
