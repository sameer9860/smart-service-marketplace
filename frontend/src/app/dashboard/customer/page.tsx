"use client";

import React, { useEffect, useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { 
  Package, Clock, CheckCircle2, 
  XCircle, ArrowRight, Star,
  MessageSquare, ShieldCheck, MapPin,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ReviewModal from '@/components/ReviewModal';
import ChatWindow from '@/components/ChatWindow';
import { MessageSquare as ChatIcon } from 'lucide-react';

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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobCount, setJobCount] = useState(0);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
        router.push('/login');
        return;
    }

    if (role !== 'customer') {
        router.push('/dashboard/provider');
        return;
    }
    
    try {
      const [bookingsRes, jobsRes] = await Promise.all([
        api.get('/marketplace/bookings/'),
        api.get('/marketplace/jobs/')
      ]);
      setBookings(bookingsRes.data.results || bookingsRes.data);
      const myJobs = (jobsRes.data.results || jobsRes.data).filter((j: any) => j.is_owner); // Assuming backend identifies owner or we filter by email
      setJobCount(myJobs.length || (jobsRes.data.results || jobsRes.data).length); // Fallback for demo
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

  const handleOpenReview = (booking: Booking) => {
    setSelectedBooking({
        id: booking.id,
        service_id: booking.service,
        service_title: booking.service_title
    });
    setIsReviewModalOpen(true);
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
          <div className="flex gap-4">
             <div className="bg-neutral-900/40 backdrop-blur-md border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600/10 text-blue-500 rounded-xl flex items-center justify-center border border-blue-500/20">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Total Orders</p>
                  <p className="text-xl font-bold">{bookings.length}</p>
                </div>
             </div>
             <div className="bg-neutral-900/40 backdrop-blur-md border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-600/10 text-purple-500 rounded-xl flex items-center justify-center border border-purple-500/20">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Job Posts</p>
                  <p className="text-xl font-bold">{jobCount}</p>
                </div>
             </div>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : bookings.length === 0 ? (
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
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex-grow space-y-4">
                    <div className="flex items-center gap-4">
                      <StatusBadge status={booking.status} />
                      <span className="text-xs text-neutral-600 font-bold uppercase tracking-widest">Order #{booking.id}</span>
                    </div>
                    <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">
                      {booking.service_title || "Custom Service"}
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
                      <button 
                        onClick={() => handleCancelBooking(booking.id)}
                        className="px-6 py-3 border border-red-500/20 hover:bg-red-500/10 text-red-500 text-sm font-bold rounded-xl transition-all"
                      >
                        Cancel Order
                      </button>
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
                      onClick={() => setActiveConversationId(booking.id)} // For demo, assuming conversation ID matches booking ID or we fetch it
                      className="px-6 py-3 bg-white/5 hover:bg-blue-600/10 text-white hover:text-blue-500 text-sm font-bold rounded-xl transition-all flex items-center gap-2 border border-transparent hover:border-blue-500/20"
                    >
                      Message
                      <ChatIcon className="w-4 h-4" />
                    </button>
                    <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2">
                      Order Details
                      <ArrowRight className="w-4 h-4" />
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
    </div>
  );
}
