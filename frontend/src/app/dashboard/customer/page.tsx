"use client";

import React, { useEffect, useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { 
  Package, Clock, CheckCircle2, PlusCircle,
  XCircle, ArrowRight, Star,
  MessageSquare, ShieldCheck, MapPin,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ReviewModal from '@/components/ReviewModal';
import ChatWindow from '@/components/ChatWindow';
import CheckoutModal from '@/components/CheckoutModal';
import { MessageSquare as ChatIcon, CreditCard } from 'lucide-react';

interface Booking {
  id: number;
  service_title: string;
  provider_email: string;
  status: string;
  created_at: string;
  price?: string;
  service?: number;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'jobs'>('orders');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [bookingToPay, setBookingToPay] = useState<any>(null);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
        router.push('/login');
        return;
    }

    if (role === 'provider') {
        router.push('/dashboard/provider');
        return;
    }

    if (role !== 'customer') {
        router.push('/login');
        return;
    }
    
    try {
      const [bookingsRes, jobsRes] = await Promise.all([
        api.get('/marketplace/bookings/'),
        api.get('/marketplace/jobs/')
      ]);
      setBookings(bookingsRes.data.results || bookingsRes.data);
      setJobs(jobsRes.data.results || jobsRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelBooking = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.post(`/marketplace/bookings/${id}/cancel_booking/`);
      fetchBookings();
    } catch (err) {
      console.error("Cancellation failed", err);
      alert("Failed to cancel booking. Please try again.");
    }
  };

  const handleAcceptBid = async (bidId: number) => {
    if (!confirm("Are you sure you want to accept this bid?")) return;
    try {
      await api.post(`/marketplace/bids/${bidId}/accept_bid/`);
      fetchData();
    } catch (err) {
      console.error("Failed to accept bid", err);
      alert("Failed to accept bid. Please try again.");
    }
  };

  const handleOpenReview = (booking: Booking) => {
    setSelectedBooking({
        id: booking.id,
        service_id: booking.service,
        service_title: booking.service_title
    });
    setIsReviewModalOpen(true);
  };

  const handleOpenCheckout = (booking: any) => {
    setBookingToPay(booking);
    setIsCheckoutModalOpen(true);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: any = {
      pending: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <DashboardSidebar />
      
      <main className="flex-grow p-12 overflow-y-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tighter">My Service Orders</h1>
            <p className="text-neutral-500 font-medium">Track your active bookings and manage your service history.</p>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              href="/jobs/new"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Post a Job
            </Link>
          </div>
        </header>

        {/* Tab Switcher */}
        <div className="flex gap-8 mb-12 border-b border-white/5">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'orders' ? 'text-blue-500' : 'text-neutral-500 hover:text-white'}`}
          >
            Service Orders
            <span className="ml-2 px-2 py-0.5 bg-neutral-800 rounded-md text-[10px]">{bookings.length}</span>
            {activeTab === 'orders' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 animate-in slide-in-from-left-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('jobs')}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'jobs' ? 'text-blue-500' : 'text-neutral-500 hover:text-white'}`}
          >
            My Job Posts
            <span className="ml-2 px-2 py-0.5 bg-neutral-800 rounded-md text-[10px]">{jobs.length}</span>
            {activeTab === 'jobs' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 animate-in slide-in-from-left-full"></div>}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : activeTab === 'orders' ? (
          bookings.length === 0 ? (
            <div className="bg-neutral-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-20 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/5">
                <Package className="w-10 h-10 text-neutral-600" />
              </div>
              <h2 className="text-3xl font-black mb-4">No Bookings Yet</h2>
              <p className="text-neutral-500 max-w-md mb-8">You haven't booked any services yet. Explore our marketplace to find the best professionals for your needs.</p>
              <Link href="/" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20">
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {bookings.map((booking) => (
                <div key={booking.id} className="group bg-neutral-900/40 backdrop-blur-md border border-white/5 p-8 rounded-[2rem] hover:border-blue-500/30 transition-all duration-300">
                  {/* ... booking card content (remains same) ... */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex-grow space-y-4">
                      <div className="flex items-center gap-4">
                        <StatusBadge status={booking.status} />
                        <span className="text-xs text-neutral-600 font-bold uppercase tracking-widest">Order #{booking.id}</span>
                      </div>
                      <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">
                        {booking.service_details?.title || booking.service_title || "Custom Service"}
                      </h3>
                      <div className="flex flex-wrap gap-6 text-sm text-neutral-500">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <span className="font-medium">{booking.provider_email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Booked on {new Date(booking.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {booking.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleCancelBooking(booking.id)}
                            className="px-6 py-3 border border-red-500/20 hover:bg-red-500/10 text-red-500 text-sm font-bold rounded-xl transition-all"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleOpenCheckout(booking)}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 group"
                          >
                            <CreditCard className="w-4 h-4" />
                            Pay Now
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      )}
                      {booking.status === 'completed' && (
                        <button 
                          onClick={() => handleOpenReview(booking)}
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2"
                        >
                          Leave Review
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => setActiveConversationId(booking.id)}
                        className="px-6 py-3 bg-white/5 hover:bg-blue-600/10 text-white hover:text-blue-500 text-sm font-bold rounded-xl transition-all flex items-center gap-2 border border-transparent hover:border-blue-500/20"
                      >
                        Message
                        <ChatIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {booking.status !== 'cancelled' && (
                    <div className="mt-8 pt-8 border-t border-white/5">
                      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`absolute top-0 left-0 h-full transition-all duration-1000 ${
                            booking.status === 'pending' ? 'w-1/3 bg-orange-500' :
                            booking.status === 'confirmed' ? 'w-2/3 bg-blue-500' :
                            'w-full bg-emerald-500'
                          }`}
                        />
                      </div>
                      <div className="flex justify-between mt-4">
                        <div className={`text-[10px] font-black uppercase tracking-widest ${booking.status === 'pending' ? 'text-orange-500' : 'text-neutral-700'}`}>Requested</div>
                        <div className={`text-[10px] font-black uppercase tracking-widest ${booking.status === 'confirmed' ? 'text-blue-500' : 'text-neutral-700'}`}>In Progress</div>
                        <div className={`text-[10px] font-black uppercase tracking-widest ${booking.status === 'completed' ? 'text-emerald-500' : 'text-neutral-700'}`}>Delivered</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          /* Jobs Tab */
          jobs.length === 0 ? (
            <div className="bg-neutral-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-20 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/5">
                <Briefcase className="w-10 h-10 text-neutral-600" />
              </div>
              <h2 className="text-3xl font-black mb-4">No Jobs Posted</h2>
              <p className="text-neutral-500 max-w-md mb-8">Need something specific? Post a job request and get custom quotes from top professionals.</p>
              <Link href="/jobs/new" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20">
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {jobs.map((job) => (
                <div key={job.id} className="bg-neutral-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden">
                  <div className="p-8 border-b border-white/5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-black mb-2">{job.title}</h3>
                        <p className="text-neutral-500 line-clamp-2 max-w-2xl">{job.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Budget</p>
                        <p className="text-2xl font-black text-blue-500">${job.budget}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${job.status === 'open' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-neutral-800 text-neutral-500 border-white/5'}`}>
                        {job.status}
                      </span>
                      <span className="text-xs text-neutral-600 font-bold uppercase tracking-widest">
                        {job.bids?.length || 0} Bids Received
                      </span>
                    </div>
                  </div>

                  {/* Bids List */}
                  <div className="p-8 bg-black/20">
                    <h4 className="text-sm font-black uppercase tracking-widest text-neutral-400 mb-6">Proposals</h4>
                    <div className="space-y-4">
                      {job.bids && job.bids.length > 0 ? job.bids.map((bid: any) => (
                        <div key={bid.id} className="bg-neutral-900/60 border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-blue-500/30 transition-all">
                          <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-black text-white">{bid.provider_email}</span>
                              <span className="px-2 py-0.5 bg-blue-600/10 text-blue-500 text-[10px] font-bold rounded">TOP PRO</span>
                            </div>
                            <p className="text-sm text-neutral-400 italic mb-1 line-clamp-1">"{bid.message}"</p>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <p className="text-xl font-black text-white">${bid.amount}</p>
                              <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Bid Amount</p>
                            </div>
                            {job.status === 'open' && (
                              <button 
                                onClick={() => handleAcceptBid(bid.id)}
                                className="px-6 py-3 bg-white text-black font-black text-xs rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-xl"
                              >
                                Accept Bid
                              </button>
                            )}
                          </div>
                        </div>
                      )) : (
                        <p className="text-center py-8 text-neutral-600 text-sm italic">Waiting for proposals from providers...</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>

      {selectedBooking && (
        <ReviewModal 
          isOpen={isReviewModalOpen} 
          onClose={() => {
            setIsReviewModalOpen(false);
            fetchData();
          }} 
          booking={selectedBooking} 
        />
      )}

      {/* Slide-over Chat */}
      {activeConversationId && (
        <div className="fixed inset-y-0 right-0 w-full lg:w-[450px] z-50 shadow-2xl">
          <ChatWindow 
            conversationId={activeConversationId} 
            onClose={() => setActiveConversationId(null)} 
          />
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        booking={bookingToPay}
        onSuccess={() => {
          fetchData();
          setIsCheckoutModalOpen(false);
        }}
      />
    </div>
  );
}
