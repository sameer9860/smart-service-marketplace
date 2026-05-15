"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, CheckCircle, 
  Clock, DollarSign, AlertCircle,
  Save, Loader2
} from 'lucide-react';
import api from '@/lib/api';

interface Milestone {
  id?: number;
  title: string;
  amount: number;
  status: string;
}

interface MilestoneManagerProps {
  bookingId: number;
  totalAmount: number;
  existingMilestones: Milestone[];
  onUpdate: () => void;
}

export default function MilestoneManager({ bookingId, totalAmount, existingMilestones, onUpdate }: MilestoneManagerProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(existingMilestones);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentTotal = milestones.reduce((sum, m) => sum + Number(m.amount), 0);
  const remaining = totalAmount - currentTotal;

  const handleAddMilestone = async () => {
    if (!newTitle || !newAmount) return;
    if (Number(newAmount) > remaining) {
      setError("Milestone amount exceeds project budget.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/marketplace/milestones/', {
        booking: bookingId,
        title: newTitle,
        amount: newAmount
      });
      setNewTitle('');
      setNewAmount('');
      onUpdate();
    } catch (err) {
      console.error("Failed to add milestone", err);
      setError("Failed to create milestone.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-white flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-500" />
          Project Milestones
        </h3>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Remaining</span>
          <span className="text-sm font-black text-emerald-500">${remaining.toFixed(2)}</span>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {milestones.map((m, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl group transition-all hover:border-blue-500/20">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                m.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                m.status === 'paid' ? 'bg-blue-500/10 text-blue-500' : 'bg-neutral-800 text-neutral-500'
              }`}>
                {m.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-white">{m.title}</p>
                <p className="text-xs text-neutral-500 font-medium capitalize">{m.status}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <span className="font-black text-white">${Number(m.amount).toLocaleString()}</span>
            </div>
          </div>
        ))}

        {remaining > 0 && (
          <div className="pt-4 border-t border-white/5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Phase Title (e.g. Design Concepts)"
                className="bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
                <input 
                  type="number" 
                  placeholder="Amount"
                  className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                />
              </div>
            </div>
            
            {error && (
              <p className="text-red-500 text-xs font-bold flex items-center gap-2 ml-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}

            <button 
              onClick={handleAddMilestone}
              disabled={loading || !newTitle || !newAmount}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Milestone
            </button>
          </div>
        )}
      </div>

      <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-neutral-500 leading-relaxed">
          Create milestones to break the project into paid phases. The total of all milestones must equal the project budget of <span className="text-white font-bold">${totalAmount}</span>.
        </p>
      </div>
    </div>
  );
}
