"use client";

import React, { useEffect, useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { 
  User, Mail, Shield, 
  Calendar, Edit3, Check,
  Loader2, LogOut, Camera
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  email: string;
  role: string;
  full_name: string;
  date_joined: string;
}

export default function ProfilePage() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/accounts/profile/');
      setProfile(response.data);
      setNewName(response.data.full_name);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const response = await api.put('/accounts/profile/', { full_name: newName });
      setProfile(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <DashboardSidebar />
      
      <main className="flex-grow p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black mb-2 tracking-tighter">My Profile</h1>
          <p className="text-neutral-500 font-medium">Manage your personal information and account settings.</p>
        </header>

        <div className="max-w-4xl space-y-8">
          {/* Profile Header Card */}
          <div className="bg-neutral-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
              <div className="relative group/avatar">
                <div className="w-32 h-32 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-blue-600/20 border-4 border-white/10 group-hover:scale-105 transition-transform duration-500">
                  {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <button className="absolute -bottom-2 -right-2 p-3 bg-white text-black rounded-2xl shadow-xl opacity-0 group-hover/avatar:opacity-100 transition-all hover:scale-110">
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-grow text-center md:text-left space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <h2 className="text-3xl font-black tracking-tight">{profile?.full_name || "User Name"}</h2>
                  <span className="px-3 py-1 bg-blue-600/10 text-blue-500 text-[10px] font-black rounded-full border border-blue-500/20 uppercase tracking-widest">
                    {profile?.role}
                  </span>
                </div>
                <p className="text-neutral-500 font-medium flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-4 h-4" />
                  {profile?.email}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-neutral-600 font-bold uppercase tracking-widest pt-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {new Date(profile?.date_joined || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>

              <div className="flex flex-col gap-3 shrink-0">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/5 flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
                <button 
                  onClick={logout}
                  className="px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold rounded-xl transition-all flex items-center gap-2 group"
                >
                  <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-neutral-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] p-8 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Account Details
              </h3>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text"
                    disabled={!isEditing}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-neutral-800/50 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-500 uppercase tracking-widest ml-1">Email (Primary)</label>
                  <input 
                    type="email"
                    disabled
                    value={profile?.email}
                    className="w-full bg-neutral-800/50 border border-white/5 rounded-2xl p-4 text-neutral-600 cursor-not-allowed"
                  />
                </div>

                {isEditing && (
                  <button 
                    type="submit"
                    disabled={saveLoading}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    {saveLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    Save Changes
                  </button>
                )}
              </form>
            </div>

            <div className="bg-neutral-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] p-8 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-500" />
                Security & Preferences
              </h3>
              <div className="space-y-4">
                <button className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-left font-bold transition-all flex items-center justify-between group">
                  Change Password
                  <Edit3 className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors" />
                </button>
                <button className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-left font-bold transition-all flex items-center justify-between group">
                  Notification Settings
                  <Edit3 className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors" />
                </button>
                <div className="pt-4 mt-4 border-t border-white/5">
                   <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                     Deleting your account is permanent. All your data, including booking history and active listings, will be removed.
                   </p>
                   <button className="text-red-500 text-sm font-bold mt-4 hover:underline">Deactivate Account</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
