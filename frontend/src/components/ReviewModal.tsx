"use client";

import React, { useState } from 'react';
import { 
  X, Star, MessageSquare, 
  Send, CheckCircle2, AlertCircle,
  Loader2
} from 'lucide-react';
import api from '@/lib/api';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: number;
    service_id: number;
    service_title: string;
  };
}

export default function ReviewModal({ isOpen, onClose, booking }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await api.post('/marketplace/reviews/', {
        service: booking.service_id,
        rating: rating,
        comment: comment
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setRating(0);
        setComment('');
      }, 2500);
    } catch (err: any) {
        console.error("Review submission failed", err);
        setError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-neutral-950 border border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight">Rate Your Experience</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full text-neutral-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {success ? (
            <div className="py-12 flex flex-col items-center text-center animate-in slide-in-from-bottom-4">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Thank You!</h3>
              <p className="text-neutral-400">Your feedback helps our community of professionals grow.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="text-center space-y-4">
                <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">
                  How was your service for <span className="text-white">{booking.service_title}</span>?
                </p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="p-1 transition-transform active:scale-90"
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setRating(star)}
                    >
                      <Star 
                        className={`w-10 h-10 transition-colors ${
                          (hover || rating) >= star 
                            ? 'fill-yellow-500 text-yellow-500' 
                            : 'text-neutral-800'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-bold text-neutral-400 uppercase tracking-widest ml-1">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  Your Thoughts
                </label>
                <textarea 
                  rows={4}
                  placeholder="Share your experience... what did you like?"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white placeholder:text-neutral-700 focus:outline-none focus:border-blue-500/50 transition-all resize-none leading-relaxed"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm animate-in shake-1">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
                >
                  Skip
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Submit Review
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
