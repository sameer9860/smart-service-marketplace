"use client";

import React, { useState } from 'react';
import { 
  X, Check, AlertCircle, Shield, 
  CreditCard, Calendar, Info
} from 'lucide-react';
import api from '@/lib/api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    id: number;
    title: string;
    price: string;
  };
}

export default function BookingModal({ isOpen, onClose, service }: BookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/marketplace/bookings/', {
        service: service.id,
        // Backend handles current user
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Booking failed:', err);
      if (err.response?.status === 401) {
        setError("Please login to book this service.");
      } else {
        setError(err.response?.data?.detail || "Booking failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-neutral-950 border border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-white">Confirm Booking</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full text-neutral-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {success ? (
            <div className="py-12 flex flex-col items-center text-center animate-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
                <Check className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Success!</h3>
              <p className="text-neutral-400">Your booking for <b>{service.title}</b> has been confirmed. You can track it in your dashboard.</p>
            </div>
          ) : (
            <>
              <div className="bg-white/5 rounded-3xl p-6 mb-8 border border-white/5">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm text-neutral-500 font-bold uppercase tracking-widest">Service</span>
                  <span className="text-sm text-blue-500 font-bold">Verified</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{service.title}</h3>
                <p className="text-2xl font-black text-white">${service.price}</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-neutral-400">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-neutral-500">
                    <Shield className="w-4 h-4" />
                  </div>
                  Secure payment through Smart Marketplace
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-400">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-neutral-500">
                    <Calendar className="w-4 h-4" />
                  </div>
                  Immediate provider notification
                </div>
              </div>

              {error && (
                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm animate-in shake-1 duration-300">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBooking}
                  disabled={loading}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Confirm & Pay
                      <CreditCard className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-neutral-600 font-bold uppercase tracking-tighter">
                <Info className="w-3 h-3" />
                By confirming, you agree to our terms of service
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
