"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { 
  Briefcase, DollarSign, Clock, User, 
  ChevronLeft, Send, Loader2, CheckCircle,
  MessageSquare, ShieldCheck, AlertCircle,
  Trophy
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface Bid {
  id: number;
  provider_email: string;
  amount: string;
  message: string;
  status: string;
  created_at: string;
}

interface Job {
  id: number;
  title: string;
  description: string;
  budget: string;
  status: string;
  created_at: string;
  customer_email: string;
  category_name: string;
  bids?: Bid[];
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Bid Form State (for Providers)
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, profileRes] = await Promise.all([
          api.get(`/marketplace/jobs/${params.id}/`),
          api.get('/accounts/profile/').catch(() => ({ data: { email: null, role: null } }))
        ]);
        setJob(jobRes.data);
        setUserEmail(profileRes.data.email);
        setUserRole(profileRes.data.role);
      } catch (err) {
        console.error("Failed to fetch job details", err);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchData();
  }, [params.id]);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingBid(true);
    try {
      await api.post('/marketplace/bids/', {
        job: params.id,
        amount: bidAmount,
        message: bidMessage
      });
      setBidSuccess(true);
    } catch (err: any) {
      console.error("Bid submission failed", err);
      alert(err.response?.data?.detail || "Failed to submit bid. Please try again.");
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleAcceptBid = async (bidId: number) => {
    if (!confirm("Accepting this bid will close the job and create a new booking. Continue?")) return;
    try {
      await api.post(`/marketplace/bids/${bidId}/accept_bid/`);
      router.push('/dashboard/customer?bid_accepted=true');
    } catch (err) {
      console.error("Failed to accept bid", err);
      alert("Failed to accept bid. Please try again.");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
    </div>
  );

  if (!job) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-black mb-4">Job Not Found</h1>
      <Link href="/jobs" className="text-blue-500 hover:underline">Back to Jobs</Link>
    </div>
  );

  const isOwner = userEmail === job.customer_email;
  const isProvider = userRole === 'provider';

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Job Info */}
          <div className="lg:col-span-2 space-y-12">
            <Link 
              href="/jobs"
              className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Marketplace
            </Link>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-blue-600/10 text-blue-500 text-[10px] font-black rounded-full border border-blue-500/20 uppercase tracking-widest">
                  {job.category_name}
                </span>
                <span className="px-3 py-1 bg-white/5 text-neutral-500 text-[10px] font-black rounded-full border border-white/5 uppercase tracking-widest">
                  Job #{job.id}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter leading-tight">
                {job.title}
              </h1>
              
              <div className="flex flex-wrap gap-8 py-8 border-y border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase font-bold tracking-tighter">Budget</p>
                    <p className="text-lg font-black text-white">${job.budget}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase font-bold tracking-tighter">Posted</p>
                    <p className="text-lg font-black text-white">{new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-blue-500" />
                Project Description
              </h2>
              <p className="text-neutral-400 text-lg leading-relaxed whitespace-pre-wrap bg-neutral-900/40 backdrop-blur-md border border-white/5 p-8 rounded-3xl">
                {job.description}
              </p>
            </section>

            {/* Bids List (Visible to Owner) */}
            {isOwner && (
              <section className="space-y-8">
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <Trophy className="w-7 h-7 text-yellow-500" />
                  Received Bids ({job.bids?.length || 0})
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {job.bids?.map((bid) => (
                    <div key={bid.id} className="bg-neutral-900/60 border border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between gap-8 group">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-black">
                            {bid.provider_email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white">{bid.provider_email}</p>
                            <p className="text-xs text-neutral-500 uppercase tracking-widest font-black">Provider</p>
                          </div>
                        </div>
                        <p className="text-neutral-400 font-medium">{bid.message}</p>
                      </div>
                      <div className="flex flex-col items-end justify-center gap-4 shrink-0">
                         <div className="text-3xl font-black text-emerald-500">${bid.amount}</div>
                         {job.status === 'open' ? (
                           <button 
                             onClick={() => handleAcceptBid(bid.id)}
                             className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                           >
                             Accept Bid
                           </button>
                         ) : (
                           <span className="px-4 py-2 bg-white/5 text-neutral-500 font-bold rounded-xl border border-white/5">
                             {bid.status === 'accepted' ? 'Accepted' : 'Closed'}
                           </span>
                         )}
                      </div>
                    </div>
                  ))}
                  {(!job.bids || job.bids.length === 0) && (
                    <div className="p-12 text-center bg-neutral-900/20 border border-dashed border-white/10 rounded-[2.5rem]">
                      <p className="text-neutral-500 font-bold">No bids received yet. Your job is visible to all providers.</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Provider Action */}
          {!isOwner && isProvider && (
            <div className="lg:col-span-1">
              <div className="sticky top-32 space-y-6">
                <div className="bg-neutral-900/60 backdrop-blur-2xl border border-blue-500/20 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-500/5 relative overflow-hidden">
                  {bidSuccess ? (
                    <div className="text-center py-8 space-y-4 animate-in zoom-in-95">
                      <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-white shadow-xl shadow-emerald-500/20">
                        <CheckCircle className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-black">Bid Submitted!</h3>
                      <p className="text-neutral-500 text-sm">The customer will review your bid and contact you soon.</p>
                      <button 
                        onClick={() => router.push('/dashboard/provider')}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all mt-4"
                      >
                        Go to Dashboard
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                      <h3 className="text-2xl font-black mb-6 relative z-10">Submit a Bid</h3>
                      <form onSubmit={handleBidSubmit} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Your Price ($)</label>
                          <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
                            <input 
                              type="number" 
                              required
                              placeholder="e.g. 450"
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Pitch / Proposal</label>
                          <textarea 
                            required
                            rows={4}
                            placeholder="Why should you be hired for this job?"
                            value={bidMessage}
                            onChange={(e) => setBidMessage(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none text-sm"
                          />
                        </div>
                        <button 
                          type="submit"
                          disabled={submittingBid || job.status !== 'open'}
                          className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                          {submittingBid ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                          {job.status === 'open' ? 'Send Bid Proposal' : 'Job Closed'}
                        </button>
                      </form>
                    </>
                  )}
                </div>

                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-center gap-4">
                   <div className="w-10 h-10 bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center">
                     <ShieldCheck className="w-5 h-5" />
                   </div>
                   <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                     Your payment is secured until you approve the provider's work.
                   </p>
                </div>
              </div>
            </div>
          )}

          {/* If Guest or Customer (Not Owner) */}
          {!isOwner && !isProvider && (
            <div className="lg:col-span-1">
               <div className="bg-neutral-900/60 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] text-center space-y-6">
                  <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto text-blue-500">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black">Interested in this job?</h3>
                  <p className="text-neutral-500 text-sm">You need to be a verified Provider to submit bids on marketplace requests.</p>
                  <Link 
                    href="/register"
                    className="block w-full py-4 bg-white text-black font-black rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                  >
                    Become a Provider
                  </Link>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
