"use client";

import React, { useState } from 'react';
import { 
  X, CreditCard, ShieldCheck, 
  Loader2, CheckCircle2, AlertCircle,
  ArrowRight, ArrowLeft, ShoppingBag
} from 'lucide-react';
import api from '@/lib/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onSuccess: () => void;
}

export default function CheckoutModal({ isOpen, onClose, booking, onSuccess }: CheckoutModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  if (!isOpen || !booking) return null;

  const handleProcessPayment = async () => {
    setLoading(true);
    setError(null);
    setStep(3); // Processing state

    try {
      // 1. Create payment record (or it might be pre-created by approved booking)
      // For this mock, we assume the backend handles creation if it doesn't exist
      // or we just trigger the process action on the payment linked to the booking
      
      const paymentRes = await api.post(`/marketplace/payments/${booking.payment.id}/process_payment/`);
      
      setStep(4); // Success state
      setTimeout(() => {
        onSuccess();
        onClose();
        setStep(1);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Payment failed. Please try again.");
      setStep(2); // Back to card entry
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full text-neutral-500 hover:text-white transition-colors z-20">
          <X className="w-5 h-5" />
        </button>

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-neutral-800">
          <div 
            className="h-full bg-blue-600 transition-all duration-500" 
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>

        <div className="p-10 pt-12">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-600/10 rounded-[1.5rem] flex items-center justify-center border border-blue-500/20 mb-4">
                  <ShoppingBag className="w-8 h-8 text-blue-500" />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white">Review Your Order</h2>
                <p className="text-neutral-500 font-medium">Please confirm your booking details</p>
              </div>

              <div className="bg-black/30 rounded-3xl border border-white/5 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 text-sm font-bold uppercase tracking-widest">Service</span>
                  <span className="text-white font-black">{booking.service_details?.title || "Professional Service"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 text-sm font-bold uppercase tracking-widest">Provider</span>
                  <span className="text-white font-bold">{booking.provider_details?.full_name || booking.provider_email}</span>
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-white text-lg font-black">Total Amount</span>
                  <span className="text-blue-500 text-2xl font-black">${booking.service_details?.price || booking.price}</span>
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full py-5 bg-white text-black font-black rounded-2xl shadow-xl hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 group"
              >
                Proceed to Payment
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-600/10 rounded-[1.5rem] flex items-center justify-center border border-blue-500/20 mb-4">
                  <CreditCard className="w-8 h-8 text-blue-500" />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white">Payment Method</h2>
                <p className="text-neutral-500 font-medium">Enter your card details securely</p>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Cardholder Name</label>
                  <input 
                    type="text"
                    placeholder="JOHN DOE"
                    className="w-full bg-black/50 border border-white/5 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-neutral-800"
                    value={cardData.name}
                    onChange={(e) => setCardData({...cardData, name: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Card Number</label>
                  <input 
                    type="text"
                    placeholder="•••• •••• •••• ••••"
                    className="w-full bg-black/50 border border-white/5 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-neutral-800 font-mono"
                    value={cardData.number}
                    onChange={(e) => setCardData({...cardData, number: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Expiry Date</label>
                    <input 
                      type="text"
                      placeholder="MM / YY"
                      className="w-full bg-black/50 border border-white/5 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-neutral-800 font-mono"
                      value={cardData.expiry}
                      onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">CVC Code</label>
                    <input 
                      type="text"
                      placeholder="•••"
                      className="w-full bg-black/50 border border-white/5 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-neutral-800 font-mono"
                      value={cardData.cvc}
                      onChange={(e) => setCardData({...cardData, cvc: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-5 bg-neutral-800 hover:bg-neutral-700 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleProcessPayment}
                  className="flex-1 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                >
                  Pay ${booking.service_details?.price || booking.price}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-12 flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in-95">
              <div className="relative">
                <div className="w-24 h-24 bg-blue-600/10 rounded-[2rem] flex items-center justify-center border border-blue-500/20">
                  <ShieldCheck className="w-12 h-12 text-blue-500" />
                </div>
                <div className="absolute inset-0 w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-[2.2rem] animate-spin"></div>
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white mb-2">Processing Payment</h2>
                <p className="text-neutral-500 font-medium max-w-[240px]">We are securely encrypting and processing your transaction...</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="py-12 flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in-95">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-500/20">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white mb-2">Payment Successful!</h2>
                <p className="text-neutral-500 font-medium">Your booking has been confirmed and the provider has been notified.</p>
              </div>
            </div>
          )}
        </div>

        {/* Trust Footer */}
        <div className="bg-black/50 border-t border-white/5 p-6 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-[10px] font-black text-neutral-600 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            256-bit SSL Secure
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-neutral-600 uppercase tracking-widest">
            <CreditCard className="w-4 h-4" />
            Verified Gateway
          </div>
        </div>
      </div>
    </div>
  );
}
